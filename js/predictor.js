/* =========================================================
   JEE College Predictor 2026 – predictor.js
   Includes college data, prediction logic, filters,
   PDF download (print), and share functionality.
   ========================================================= */

'use strict';

/* ── Category rank multipliers (approximate) ───────────── */
const CATEGORY_MULTIPLIER = {
  general: 1,
  ews:     1.6,
  obc:     2.2,
  sc:      4.5,
  st:      6.5,
  pwd:     8.0
};

/* ── Percentile → Approximate Rank conversion ──────────── */
/* Based on JEE Main 2024: ~12.2 lakh candidates appeared */
function percentileToRank(percentile) {
  const total = 1220000;
  return Math.round((1 - percentile / 100) * total) + 1;
}

/* ── College Database ──────────────────────────────────── */
/* Each entry represents one branch at one college.
   Fields:
     id          – unique id
     name        – college full name
     shortName   – display abbreviation
     type        – IIT | NIT | IIIT | GFTI
     city        – city
     state       – Indian state
     nirfRank    – NIRF 2023 overall engineering rank
     feesPA      – approximate annual fees (INR)
     branch      – branch name
     openRank    – opening rank (general) from prev year
     closeRank   – closing rank (general) from prev year
     examType    – "JEE Advanced" | "JEE Main"
*/
const COLLEGES = [
  /* ═══════════════════ IITs (JEE Advanced) ══════════════ */
  /* IIT Bombay */
  { id:1,  name:"IIT Bombay",           shortName:"IIT Bombay",   type:"IIT",  city:"Mumbai",      state:"Maharashtra",  nirfRank:3,  feesPA:220000, branch:"Computer Science & Engineering",       openRank:1,    closeRank:67,    examType:"JEE Advanced" },
  { id:2,  name:"IIT Bombay",           shortName:"IIT Bombay",   type:"IIT",  city:"Mumbai",      state:"Maharashtra",  nirfRank:3,  feesPA:220000, branch:"Electrical Engineering",                openRank:68,   closeRank:200,   examType:"JEE Advanced" },
  { id:3,  name:"IIT Bombay",           shortName:"IIT Bombay",   type:"IIT",  city:"Mumbai",      state:"Maharashtra",  nirfRank:3,  feesPA:220000, branch:"Mechanical Engineering",                openRank:201,  closeRank:500,   examType:"JEE Advanced" },
  { id:4,  name:"IIT Bombay",           shortName:"IIT Bombay",   type:"IIT",  city:"Mumbai",      state:"Maharashtra",  nirfRank:3,  feesPA:220000, branch:"Civil Engineering",                     openRank:501,  closeRank:900,   examType:"JEE Advanced" },
  /* IIT Delhi */
  { id:5,  name:"IIT Delhi",            shortName:"IIT Delhi",    type:"IIT",  city:"New Delhi",   state:"Delhi",        nirfRank:2,  feesPA:210000, branch:"Computer Science & Engineering",       openRank:1,    closeRank:118,   examType:"JEE Advanced" },
  { id:6,  name:"IIT Delhi",            shortName:"IIT Delhi",    type:"IIT",  city:"New Delhi",   state:"Delhi",        nirfRank:2,  feesPA:210000, branch:"Electrical Engineering",                openRank:119,  closeRank:300,   examType:"JEE Advanced" },
  { id:7,  name:"IIT Delhi",            shortName:"IIT Delhi",    type:"IIT",  city:"New Delhi",   state:"Delhi",        nirfRank:2,  feesPA:210000, branch:"Mechanical Engineering",                openRank:301,  closeRank:650,   examType:"JEE Advanced" },
  { id:8,  name:"IIT Delhi",            shortName:"IIT Delhi",    type:"IIT",  city:"New Delhi",   state:"Delhi",        nirfRank:2,  feesPA:210000, branch:"Civil Engineering",                     openRank:651,  closeRank:1050,  examType:"JEE Advanced" },
  /* IIT Madras */
  { id:9,  name:"IIT Madras",           shortName:"IIT Madras",   type:"IIT",  city:"Chennai",     state:"Tamil Nadu",   nirfRank:1,  feesPA:215000, branch:"Computer Science & Engineering",       openRank:1,    closeRank:110,   examType:"JEE Advanced" },
  { id:10, name:"IIT Madras",           shortName:"IIT Madras",   type:"IIT",  city:"Chennai",     state:"Tamil Nadu",   nirfRank:1,  feesPA:215000, branch:"Electrical Engineering",                openRank:111,  closeRank:290,   examType:"JEE Advanced" },
  { id:11, name:"IIT Madras",           shortName:"IIT Madras",   type:"IIT",  city:"Chennai",     state:"Tamil Nadu",   nirfRank:1,  feesPA:215000, branch:"Mechanical Engineering",                openRank:291,  closeRank:600,   examType:"JEE Advanced" },
  { id:12, name:"IIT Madras",           shortName:"IIT Madras",   type:"IIT",  city:"Chennai",     state:"Tamil Nadu",   nirfRank:1,  feesPA:215000, branch:"Chemical Engineering",                  openRank:601,  closeRank:1000,  examType:"JEE Advanced" },
  /* IIT Kanpur */
  { id:13, name:"IIT Kanpur",           shortName:"IIT Kanpur",   type:"IIT",  city:"Kanpur",      state:"Uttar Pradesh",nirfRank:4,  feesPA:218000, branch:"Computer Science & Engineering",       openRank:1,    closeRank:172,   examType:"JEE Advanced" },
  { id:14, name:"IIT Kanpur",           shortName:"IIT Kanpur",   type:"IIT",  city:"Kanpur",      state:"Uttar Pradesh",nirfRank:4,  feesPA:218000, branch:"Electrical Engineering",                openRank:173,  closeRank:420,   examType:"JEE Advanced" },
  { id:15, name:"IIT Kanpur",           shortName:"IIT Kanpur",   type:"IIT",  city:"Kanpur",      state:"Uttar Pradesh",nirfRank:4,  feesPA:218000, branch:"Mechanical Engineering",                openRank:421,  closeRank:750,   examType:"JEE Advanced" },
  { id:16, name:"IIT Kanpur",           shortName:"IIT Kanpur",   type:"IIT",  city:"Kanpur",      state:"Uttar Pradesh",nirfRank:4,  feesPA:218000, branch:"Aerospace Engineering",                 openRank:751,  closeRank:1200,  examType:"JEE Advanced" },
  /* IIT Kharagpur */
  { id:17, name:"IIT Kharagpur",        shortName:"IIT KGP",      type:"IIT",  city:"Kharagpur",   state:"West Bengal",  nirfRank:5,  feesPA:148000, branch:"Computer Science & Engineering",       openRank:1,    closeRank:247,   examType:"JEE Advanced" },
  { id:18, name:"IIT Kharagpur",        shortName:"IIT KGP",      type:"IIT",  city:"Kharagpur",   state:"West Bengal",  nirfRank:5,  feesPA:148000, branch:"Electronics & Electrical Communication",openRank:248,  closeRank:500,   examType:"JEE Advanced" },
  { id:19, name:"IIT Kharagpur",        shortName:"IIT KGP",      type:"IIT",  city:"Kharagpur",   state:"West Bengal",  nirfRank:5,  feesPA:148000, branch:"Mechanical Engineering",                openRank:501,  closeRank:850,   examType:"JEE Advanced" },
  { id:20, name:"IIT Kharagpur",        shortName:"IIT KGP",      type:"IIT",  city:"Kharagpur",   state:"West Bengal",  nirfRank:5,  feesPA:148000, branch:"Civil Engineering",                     openRank:851,  closeRank:1400,  examType:"JEE Advanced" },
  /* IIT Roorkee */
  { id:21, name:"IIT Roorkee",          shortName:"IIT Roorkee",  type:"IIT",  city:"Roorkee",     state:"Uttarakhand",  nirfRank:6,  feesPA:192000, branch:"Computer Science & Engineering",       openRank:1,    closeRank:322,   examType:"JEE Advanced" },
  { id:22, name:"IIT Roorkee",          shortName:"IIT Roorkee",  type:"IIT",  city:"Roorkee",     state:"Uttarakhand",  nirfRank:6,  feesPA:192000, branch:"Electrical Engineering",                openRank:323,  closeRank:620,   examType:"JEE Advanced" },
  { id:23, name:"IIT Roorkee",          shortName:"IIT Roorkee",  type:"IIT",  city:"Roorkee",     state:"Uttarakhand",  nirfRank:6,  feesPA:192000, branch:"Mechanical Engineering",                openRank:621,  closeRank:1050,  examType:"JEE Advanced" },
  { id:24, name:"IIT Roorkee",          shortName:"IIT Roorkee",  type:"IIT",  city:"Roorkee",     state:"Uttarakhand",  nirfRank:6,  feesPA:192000, branch:"Civil Engineering",                     openRank:1051, closeRank:1600,  examType:"JEE Advanced" },
  /* IIT Guwahati */
  { id:25, name:"IIT Guwahati",         shortName:"IIT Guwahati", type:"IIT",  city:"Guwahati",    state:"Assam",        nirfRank:7,  feesPA:178000, branch:"Computer Science & Engineering",       openRank:1,    closeRank:574,   examType:"JEE Advanced" },
  { id:26, name:"IIT Guwahati",         shortName:"IIT Guwahati", type:"IIT",  city:"Guwahati",    state:"Assam",        nirfRank:7,  feesPA:178000, branch:"Electronics & Communication Engineering",openRank:575, closeRank:980,  examType:"JEE Advanced" },
  { id:27, name:"IIT Guwahati",         shortName:"IIT Guwahati", type:"IIT",  city:"Guwahati",    state:"Assam",        nirfRank:7,  feesPA:178000, branch:"Mechanical Engineering",                openRank:981,  closeRank:1600,  examType:"JEE Advanced" },
  /* IIT Hyderabad */
  { id:28, name:"IIT Hyderabad",        shortName:"IIT Hyd",      type:"IIT",  city:"Hyderabad",   state:"Telangana",    nirfRank:8,  feesPA:176000, branch:"Computer Science & Engineering",       openRank:1,    closeRank:655,   examType:"JEE Advanced" },
  { id:29, name:"IIT Hyderabad",        shortName:"IIT Hyd",      type:"IIT",  city:"Hyderabad",   state:"Telangana",    nirfRank:8,  feesPA:176000, branch:"Electrical Engineering",                openRank:656,  closeRank:1100,  examType:"JEE Advanced" },
  { id:30, name:"IIT Hyderabad",        shortName:"IIT Hyd",      type:"IIT",  city:"Hyderabad",   state:"Telangana",    nirfRank:8,  feesPA:176000, branch:"Mechanical Engineering",                openRank:1101, closeRank:1800,  examType:"JEE Advanced" },
  /* IIT Indore */
  { id:31, name:"IIT Indore",           shortName:"IIT Indore",   type:"IIT",  city:"Indore",      state:"Madhya Pradesh",nirfRank:9, feesPA:205000, branch:"Computer Science & Engineering",       openRank:1,    closeRank:1201,  examType:"JEE Advanced" },
  { id:32, name:"IIT Indore",           shortName:"IIT Indore",   type:"IIT",  city:"Indore",      state:"Madhya Pradesh",nirfRank:9, feesPA:205000, branch:"Electrical Engineering",                openRank:1202, closeRank:2000,  examType:"JEE Advanced" },
  /* IIT BHU Varanasi */
  { id:33, name:"IIT (BHU) Varanasi",   shortName:"IIT BHU",      type:"IIT",  city:"Varanasi",    state:"Uttar Pradesh",nirfRank:10, feesPA:160000, branch:"Computer Science & Engineering",       openRank:1,    closeRank:1748,  examType:"JEE Advanced" },
  { id:34, name:"IIT (BHU) Varanasi",   shortName:"IIT BHU",      type:"IIT",  city:"Varanasi",    state:"Uttar Pradesh",nirfRank:10, feesPA:160000, branch:"Electronics Engineering",               openRank:1749, closeRank:2700,  examType:"JEE Advanced" },
  { id:35, name:"IIT (BHU) Varanasi",   shortName:"IIT BHU",      type:"IIT",  city:"Varanasi",    state:"Uttar Pradesh",nirfRank:10, feesPA:160000, branch:"Mechanical Engineering",                openRank:2701, closeRank:3600,  examType:"JEE Advanced" },
  /* IIT Gandhinagar */
  { id:36, name:"IIT Gandhinagar",      shortName:"IIT Gandhi.",  type:"IIT",  city:"Gandhinagar", state:"Gujarat",      nirfRank:11, feesPA:195000, branch:"Computer Science & Engineering",       openRank:1,    closeRank:1648,  examType:"JEE Advanced" },
  { id:37, name:"IIT Gandhinagar",      shortName:"IIT Gandhi.",  type:"IIT",  city:"Gandhinagar", state:"Gujarat",      nirfRank:11, feesPA:195000, branch:"Electrical Engineering",                openRank:1649, closeRank:2400,  examType:"JEE Advanced" },
  /* IIT Jodhpur */
  { id:38, name:"IIT Jodhpur",          shortName:"IIT Jodhpur",  type:"IIT",  city:"Jodhpur",     state:"Rajasthan",    nirfRank:12, feesPA:185000, branch:"Computer Science & Engineering",       openRank:1,    closeRank:2156,  examType:"JEE Advanced" },
  { id:39, name:"IIT Jodhpur",          shortName:"IIT Jodhpur",  type:"IIT",  city:"Jodhpur",     state:"Rajasthan",    nirfRank:12, feesPA:185000, branch:"Electrical Engineering",                openRank:2157, closeRank:3100,  examType:"JEE Advanced" },
  /* IIT Patna */
  { id:40, name:"IIT Patna",            shortName:"IIT Patna",    type:"IIT",  city:"Patna",       state:"Bihar",        nirfRank:13, feesPA:170000, branch:"Computer Science & Engineering",       openRank:1,    closeRank:2823,  examType:"JEE Advanced" },
  { id:41, name:"IIT Patna",            shortName:"IIT Patna",    type:"IIT",  city:"Patna",       state:"Bihar",        nirfRank:13, feesPA:170000, branch:"Electrical Engineering",                openRank:2824, closeRank:4000,  examType:"JEE Advanced" },
  /* IIT Ropar */
  { id:42, name:"IIT Ropar",            shortName:"IIT Ropar",    type:"IIT",  city:"Rupnagar",    state:"Punjab",       nirfRank:14, feesPA:182000, branch:"Computer Science & Engineering",       openRank:1,    closeRank:2680,  examType:"JEE Advanced" },
  { id:43, name:"IIT Ropar",            shortName:"IIT Ropar",    type:"IIT",  city:"Rupnagar",    state:"Punjab",       nirfRank:14, feesPA:182000, branch:"Electrical Engineering",                openRank:2681, closeRank:3800,  examType:"JEE Advanced" },
  /* IIT Bhubaneswar */
  { id:44, name:"IIT Bhubaneswar",      shortName:"IIT BBSR",     type:"IIT",  city:"Bhubaneswar", state:"Odisha",       nirfRank:15, feesPA:178000, branch:"Computer Science & Engineering",       openRank:1,    closeRank:3103,  examType:"JEE Advanced" },
  { id:45, name:"IIT Bhubaneswar",      shortName:"IIT BBSR",     type:"IIT",  city:"Bhubaneswar", state:"Odisha",       nirfRank:15, feesPA:178000, branch:"Electrical Engineering",                openRank:3104, closeRank:4400,  examType:"JEE Advanced" },
  /* IIT Mandi */
  { id:46, name:"IIT Mandi",            shortName:"IIT Mandi",    type:"IIT",  city:"Mandi",       state:"Himachal Pradesh",nirfRank:16, feesPA:168000, branch:"Computer Science & Engineering",    openRank:1,    closeRank:3500,  examType:"JEE Advanced" },
  { id:47, name:"IIT Mandi",            shortName:"IIT Mandi",    type:"IIT",  city:"Mandi",       state:"Himachal Pradesh",nirfRank:16, feesPA:168000, branch:"Electrical Engineering",             openRank:3501, closeRank:4800,  examType:"JEE Advanced" },
  /* IIT (ISM) Dhanbad */
  { id:48, name:"IIT (ISM) Dhanbad",    shortName:"IIT ISM",      type:"IIT",  city:"Dhanbad",     state:"Jharkhand",    nirfRank:17, feesPA:155000, branch:"Computer Science & Engineering",       openRank:1,    closeRank:2245,  examType:"JEE Advanced" },
  { id:49, name:"IIT (ISM) Dhanbad",    shortName:"IIT ISM",      type:"IIT",  city:"Dhanbad",     state:"Jharkhand",    nirfRank:17, feesPA:155000, branch:"Electronics Engineering",               openRank:2246, closeRank:3400,  examType:"JEE Advanced" },
  { id:50, name:"IIT (ISM) Dhanbad",    shortName:"IIT ISM",      type:"IIT",  city:"Dhanbad",     state:"Jharkhand",    nirfRank:17, feesPA:155000, branch:"Mechanical Engineering",                openRank:3401, closeRank:4800,  examType:"JEE Advanced" },
  /* IIT Tirupati */
  { id:51, name:"IIT Tirupati",         shortName:"IIT Tirupati", type:"IIT",  city:"Tirupati",    state:"Andhra Pradesh",nirfRank:18, feesPA:175000, branch:"Computer Science & Engineering",      openRank:1,    closeRank:3800,  examType:"JEE Advanced" },
  { id:52, name:"IIT Tirupati",         shortName:"IIT Tirupati", type:"IIT",  city:"Tirupati",    state:"Andhra Pradesh",nirfRank:18, feesPA:175000, branch:"Electrical Engineering",               openRank:3801, closeRank:5200,  examType:"JEE Advanced" },
  /* IIT Goa */
  { id:53, name:"IIT Goa",              shortName:"IIT Goa",      type:"IIT",  city:"Ponda",       state:"Goa",          nirfRank:19, feesPA:172000, branch:"Computer Science & Engineering",       openRank:1,    closeRank:4500,  examType:"JEE Advanced" },
  { id:54, name:"IIT Goa",              shortName:"IIT Goa",      type:"IIT",  city:"Ponda",       state:"Goa",          nirfRank:19, feesPA:172000, branch:"Electrical Engineering",                openRank:4501, closeRank:6000,  examType:"JEE Advanced" },
  /* IIT Palakkad */
  { id:55, name:"IIT Palakkad",         shortName:"IIT Palakkad", type:"IIT",  city:"Palakkad",    state:"Kerala",       nirfRank:20, feesPA:168000, branch:"Computer Science & Engineering",       openRank:1,    closeRank:4200,  examType:"JEE Advanced" },
  { id:56, name:"IIT Palakkad",         shortName:"IIT Palakkad", type:"IIT",  city:"Palakkad",    state:"Kerala",       nirfRank:20, feesPA:168000, branch:"Electrical Engineering",                openRank:4201, closeRank:5800,  examType:"JEE Advanced" },
  /* IIT Jammu */
  { id:57, name:"IIT Jammu",            shortName:"IIT Jammu",    type:"IIT",  city:"Jammu",       state:"J&K",          nirfRank:21, feesPA:162000, branch:"Computer Science & Engineering",       openRank:1,    closeRank:4800,  examType:"JEE Advanced" },
  { id:58, name:"IIT Jammu",            shortName:"IIT Jammu",    type:"IIT",  city:"Jammu",       state:"J&K",          nirfRank:21, feesPA:162000, branch:"Electrical Engineering",                openRank:4801, closeRank:6500,  examType:"JEE Advanced" },
  /* IIT Bhilai */
  { id:59, name:"IIT Bhilai",           shortName:"IIT Bhilai",   type:"IIT",  city:"Raipur",      state:"Chhattisgarh", nirfRank:22, feesPA:158000, branch:"Computer Science & Engineering",       openRank:1,    closeRank:5100,  examType:"JEE Advanced" },
  { id:60, name:"IIT Bhilai",           shortName:"IIT Bhilai",   type:"IIT",  city:"Raipur",      state:"Chhattisgarh", nirfRank:22, feesPA:158000, branch:"Electrical Engineering",                openRank:5101, closeRank:6800,  examType:"JEE Advanced" },
  /* IIT Dharwad */
  { id:61, name:"IIT Dharwad",          shortName:"IIT Dharwad",  type:"IIT",  city:"Dharwad",     state:"Karnataka",    nirfRank:23, feesPA:155000, branch:"Computer Science & Engineering",       openRank:1,    closeRank:5500,  examType:"JEE Advanced" },
  { id:62, name:"IIT Dharwad",          shortName:"IIT Dharwad",  type:"IIT",  city:"Dharwad",     state:"Karnataka",    nirfRank:23, feesPA:155000, branch:"Electrical Engineering",                openRank:5501, closeRank:7200,  examType:"JEE Advanced" },

  /* ═══════════════════ NITs (JEE Main) ══════════════════ */
  /* NIT Trichy */
  { id:101, name:"NIT Tiruchirappalli",      shortName:"NIT Trichy",   type:"NIT",  city:"Tiruchirappalli",state:"Tamil Nadu",   nirfRank:8,  feesPA:150000, branch:"Computer Science & Engineering",   openRank:2100,  closeRank:4500,  examType:"JEE Main" },
  { id:102, name:"NIT Tiruchirappalli",      shortName:"NIT Trichy",   type:"NIT",  city:"Tiruchirappalli",state:"Tamil Nadu",   nirfRank:8,  feesPA:150000, branch:"Electronics & Communication Eng.", openRank:4501,  closeRank:8200,  examType:"JEE Main" },
  { id:103, name:"NIT Tiruchirappalli",      shortName:"NIT Trichy",   type:"NIT",  city:"Tiruchirappalli",state:"Tamil Nadu",   nirfRank:8,  feesPA:150000, branch:"Mechanical Engineering",            openRank:8201,  closeRank:13000, examType:"JEE Main" },
  { id:104, name:"NIT Tiruchirappalli",      shortName:"NIT Trichy",   type:"NIT",  city:"Tiruchirappalli",state:"Tamil Nadu",   nirfRank:8,  feesPA:150000, branch:"Civil Engineering",                 openRank:13001, closeRank:18000, examType:"JEE Main" },
  /* NIT Warangal */
  { id:105, name:"NIT Warangal",             shortName:"NIT Warangal", type:"NIT",  city:"Warangal",    state:"Telangana",    nirfRank:12, feesPA:140000, branch:"Computer Science & Engineering",   openRank:3000,  closeRank:6200,  examType:"JEE Main" },
  { id:106, name:"NIT Warangal",             shortName:"NIT Warangal", type:"NIT",  city:"Warangal",    state:"Telangana",    nirfRank:12, feesPA:140000, branch:"Electronics & Communication Eng.", openRank:6201,  closeRank:11000, examType:"JEE Main" },
  { id:107, name:"NIT Warangal",             shortName:"NIT Warangal", type:"NIT",  city:"Warangal",    state:"Telangana",    nirfRank:12, feesPA:140000, branch:"Mechanical Engineering",            openRank:11001, closeRank:16500, examType:"JEE Main" },
  /* NIT Surathkal */
  { id:108, name:"NIT Karnataka Surathkal",  shortName:"NIT Surathkal",type:"NIT",  city:"Surathkal",   state:"Karnataka",    nirfRank:13, feesPA:145000, branch:"Computer Science & Engineering",   openRank:4000,  closeRank:7800,  examType:"JEE Main" },
  { id:109, name:"NIT Karnataka Surathkal",  shortName:"NIT Surathkal",type:"NIT",  city:"Surathkal",   state:"Karnataka",    nirfRank:13, feesPA:145000, branch:"Electronics & Communication Eng.", openRank:7801,  closeRank:14000, examType:"JEE Main" },
  { id:110, name:"NIT Karnataka Surathkal",  shortName:"NIT Surathkal",type:"NIT",  city:"Surathkal",   state:"Karnataka",    nirfRank:13, feesPA:145000, branch:"Mechanical Engineering",            openRank:14001, closeRank:20000, examType:"JEE Main" },
  /* NIT Calicut */
  { id:111, name:"NIT Calicut",              shortName:"NIT Calicut",  type:"NIT",  city:"Calicut",     state:"Kerala",       nirfRank:14, feesPA:130000, branch:"Computer Science & Engineering",   openRank:4500,  closeRank:8500,  examType:"JEE Main" },
  { id:112, name:"NIT Calicut",              shortName:"NIT Calicut",  type:"NIT",  city:"Calicut",     state:"Kerala",       nirfRank:14, feesPA:130000, branch:"Electronics & Communication Eng.", openRank:8501,  closeRank:15000, examType:"JEE Main" },
  { id:113, name:"NIT Calicut",              shortName:"NIT Calicut",  type:"NIT",  city:"Calicut",     state:"Kerala",       nirfRank:14, feesPA:130000, branch:"Mechanical Engineering",            openRank:15001, closeRank:22000, examType:"JEE Main" },
  /* NIT Rourkela */
  { id:114, name:"NIT Rourkela",             shortName:"NIT Rourkela", type:"NIT",  city:"Rourkela",    state:"Odisha",       nirfRank:15, feesPA:125000, branch:"Computer Science & Engineering",   openRank:6000,  closeRank:10200, examType:"JEE Main" },
  { id:115, name:"NIT Rourkela",             shortName:"NIT Rourkela", type:"NIT",  city:"Rourkela",    state:"Odisha",       nirfRank:15, feesPA:125000, branch:"Electronics & Communication Eng.", openRank:10201, closeRank:17000, examType:"JEE Main" },
  { id:116, name:"NIT Rourkela",             shortName:"NIT Rourkela", type:"NIT",  city:"Rourkela",    state:"Odisha",       nirfRank:15, feesPA:125000, branch:"Mechanical Engineering",            openRank:17001, closeRank:24000, examType:"JEE Main" },
  /* NIT Delhi */
  { id:117, name:"NIT Delhi",                shortName:"NIT Delhi",    type:"NIT",  city:"New Delhi",   state:"Delhi",        nirfRank:20, feesPA:135000, branch:"Computer Science & Engineering",   openRank:7000,  closeRank:11500, examType:"JEE Main" },
  { id:118, name:"NIT Delhi",                shortName:"NIT Delhi",    type:"NIT",  city:"New Delhi",   state:"Delhi",        nirfRank:20, feesPA:135000, branch:"Electronics & Communication Eng.", openRank:11501, closeRank:19000, examType:"JEE Main" },
  /* NIT Kurukshetra */
  { id:119, name:"NIT Kurukshetra",          shortName:"NIT Kurukshetra",type:"NIT",city:"Kurukshetra", state:"Haryana",      nirfRank:22, feesPA:120000, branch:"Computer Science & Engineering",   openRank:8000,  closeRank:12000, examType:"JEE Main" },
  { id:120, name:"NIT Kurukshetra",          shortName:"NIT Kurukshetra",type:"NIT",city:"Kurukshetra", state:"Haryana",      nirfRank:22, feesPA:120000, branch:"Electronics & Communication Eng.", openRank:12001, closeRank:20000, examType:"JEE Main" },
  { id:121, name:"NIT Kurukshetra",          shortName:"NIT Kurukshetra",type:"NIT",city:"Kurukshetra", state:"Haryana",      nirfRank:22, feesPA:120000, branch:"Mechanical Engineering",            openRank:20001, closeRank:28000, examType:"JEE Main" },
  /* NIT Nagpur */
  { id:122, name:"VNIT Nagpur",              shortName:"NIT Nagpur",   type:"NIT",  city:"Nagpur",      state:"Maharashtra",  nirfRank:24, feesPA:115000, branch:"Computer Science & Engineering",   openRank:9000,  closeRank:13500, examType:"JEE Main" },
  { id:123, name:"VNIT Nagpur",              shortName:"NIT Nagpur",   type:"NIT",  city:"Nagpur",      state:"Maharashtra",  nirfRank:24, feesPA:115000, branch:"Electronics & Communication Eng.", openRank:13501, closeRank:21000, examType:"JEE Main" },
  { id:124, name:"VNIT Nagpur",              shortName:"NIT Nagpur",   type:"NIT",  city:"Nagpur",      state:"Maharashtra",  nirfRank:24, feesPA:115000, branch:"Mechanical Engineering",            openRank:21001, closeRank:29000, examType:"JEE Main" },
  /* MNNIT Allahabad */
  { id:125, name:"MNNIT Allahabad",          shortName:"MNNIT Allahabad",type:"NIT",city:"Prayagraj",   state:"Uttar Pradesh",nirfRank:26, feesPA:118000, branch:"Computer Science & Engineering",   openRank:10000, closeRank:14800, examType:"JEE Main" },
  { id:126, name:"MNNIT Allahabad",          shortName:"MNNIT Allahabad",type:"NIT",city:"Prayagraj",   state:"Uttar Pradesh",nirfRank:26, feesPA:118000, branch:"Electronics & Communication Eng.", openRank:14801, closeRank:23000, examType:"JEE Main" },
  /* NIT Bhopal */
  { id:127, name:"MANIT Bhopal",             shortName:"NIT Bhopal",   type:"NIT",  city:"Bhopal",      state:"Madhya Pradesh",nirfRank:28, feesPA:112000, branch:"Computer Science & Engineering",  openRank:11000, closeRank:15200, examType:"JEE Main" },
  { id:128, name:"MANIT Bhopal",             shortName:"NIT Bhopal",   type:"NIT",  city:"Bhopal",      state:"Madhya Pradesh",nirfRank:28, feesPA:112000, branch:"Electronics & Communication Eng.",openRank:15201, closeRank:24000, examType:"JEE Main" },
  /* NIT Jaipur */
  { id:129, name:"MNIT Jaipur",              shortName:"NIT Jaipur",   type:"NIT",  city:"Jaipur",      state:"Rajasthan",    nirfRank:30, feesPA:110000, branch:"Computer Science & Engineering",   openRank:12000, closeRank:16100, examType:"JEE Main" },
  { id:130, name:"MNIT Jaipur",              shortName:"NIT Jaipur",   type:"NIT",  city:"Jaipur",      state:"Rajasthan",    nirfRank:30, feesPA:110000, branch:"Electronics & Communication Eng.", openRank:16101, closeRank:25000, examType:"JEE Main" },
  /* NIT Surat */
  { id:131, name:"SVNIT Surat",              shortName:"NIT Surat",    type:"NIT",  city:"Surat",       state:"Gujarat",      nirfRank:32, feesPA:108000, branch:"Computer Science & Engineering",   openRank:14000, closeRank:18500, examType:"JEE Main" },
  { id:132, name:"SVNIT Surat",              shortName:"NIT Surat",    type:"NIT",  city:"Surat",       state:"Gujarat",      nirfRank:32, feesPA:108000, branch:"Electronics & Communication Eng.", openRank:18501, closeRank:28000, examType:"JEE Main" },
  /* NIT Durgapur */
  { id:133, name:"NIT Durgapur",             shortName:"NIT Durgapur", type:"NIT",  city:"Durgapur",    state:"West Bengal",  nirfRank:34, feesPA:105000, branch:"Computer Science & Engineering",   openRank:16000, closeRank:20000, examType:"JEE Main" },
  { id:134, name:"NIT Durgapur",             shortName:"NIT Durgapur", type:"NIT",  city:"Durgapur",    state:"West Bengal",  nirfRank:34, feesPA:105000, branch:"Electronics & Communication Eng.", openRank:20001, closeRank:30000, examType:"JEE Main" },
  /* NIT Goa */
  { id:135, name:"NIT Goa",                  shortName:"NIT Goa",      type:"NIT",  city:"Panaji",      state:"Goa",          nirfRank:36, feesPA:102000, branch:"Computer Science & Engineering",   openRank:17000, closeRank:21000, examType:"JEE Main" },
  { id:136, name:"NIT Goa",                  shortName:"NIT Goa",      type:"NIT",  city:"Panaji",      state:"Goa",          nirfRank:36, feesPA:102000, branch:"Electronics & Communication Eng.", openRank:21001, closeRank:32000, examType:"JEE Main" },
  /* NIT Silchar */
  { id:137, name:"NIT Silchar",              shortName:"NIT Silchar",  type:"NIT",  city:"Silchar",     state:"Assam",        nirfRank:38, feesPA:98000,  branch:"Computer Science & Engineering",   openRank:18000, closeRank:22000, examType:"JEE Main" },
  { id:138, name:"NIT Silchar",              shortName:"NIT Silchar",  type:"NIT",  city:"Silchar",     state:"Assam",        nirfRank:38, feesPA:98000,  branch:"Electronics & Communication Eng.", openRank:22001, closeRank:34000, examType:"JEE Main" },
  /* NIT Jalandhar */
  { id:139, name:"NIT Jalandhar",            shortName:"NIT Jalandhar",type:"NIT",  city:"Jalandhar",   state:"Punjab",       nirfRank:40, feesPA:95000,  branch:"Computer Science & Engineering",   openRank:19000, closeRank:23000, examType:"JEE Main" },
  { id:140, name:"NIT Jalandhar",            shortName:"NIT Jalandhar",type:"NIT",  city:"Jalandhar",   state:"Punjab",       nirfRank:40, feesPA:95000,  branch:"Electronics & Communication Eng.", openRank:23001, closeRank:35000, examType:"JEE Main" },
  /* NIT Hamirpur */
  { id:141, name:"NIT Hamirpur",             shortName:"NIT Hamirpur", type:"NIT",  city:"Hamirpur",    state:"Himachal Pradesh",nirfRank:42, feesPA:92000, branch:"Computer Science & Engineering",  openRank:20000, closeRank:25000, examType:"JEE Main" },
  { id:142, name:"NIT Hamirpur",             shortName:"NIT Hamirpur", type:"NIT",  city:"Hamirpur",    state:"Himachal Pradesh",nirfRank:42, feesPA:92000, branch:"Electronics & Communication Eng.",openRank:25001, closeRank:38000, examType:"JEE Main" },
  /* NIT Patna */
  { id:143, name:"NIT Patna",                shortName:"NIT Patna",    type:"NIT",  city:"Patna",       state:"Bihar",        nirfRank:44, feesPA:90000,  branch:"Computer Science & Engineering",   openRank:21000, closeRank:26000, examType:"JEE Main" },
  { id:144, name:"NIT Patna",                shortName:"NIT Patna",    type:"NIT",  city:"Patna",       state:"Bihar",        nirfRank:44, feesPA:90000,  branch:"Electronics & Communication Eng.", openRank:26001, closeRank:40000, examType:"JEE Main" },
  /* NIT Agartala */
  { id:145, name:"NIT Agartala",             shortName:"NIT Agartala", type:"NIT",  city:"Agartala",    state:"Tripura",      nirfRank:46, feesPA:85000,  branch:"Computer Science & Engineering",   openRank:24000, closeRank:28000, examType:"JEE Main" },
  { id:146, name:"NIT Agartala",             shortName:"NIT Agartala", type:"NIT",  city:"Agartala",    state:"Tripura",      nirfRank:46, feesPA:85000,  branch:"Electronics & Communication Eng.", openRank:28001, closeRank:42000, examType:"JEE Main" },
  /* NIT Manipur */
  { id:147, name:"NIT Manipur",              shortName:"NIT Manipur",  type:"NIT",  city:"Imphal",      state:"Manipur",      nirfRank:48, feesPA:80000,  branch:"Computer Science & Engineering",   openRank:28000, closeRank:35000, examType:"JEE Main" },

  /* ═══════════════════ IIITs (JEE Main) ══════════════════ */
  /* IIIT Hyderabad */
  { id:201, name:"IIIT Hyderabad",           shortName:"IIIT Hyd",     type:"IIIT", city:"Hyderabad",   state:"Telangana",    nirfRank:25, feesPA:200000, branch:"Computer Science & Engineering",   openRank:3500,  closeRank:7500,  examType:"JEE Main" },
  { id:202, name:"IIIT Hyderabad",           shortName:"IIIT Hyd",     type:"IIIT", city:"Hyderabad",   state:"Telangana",    nirfRank:25, feesPA:200000, branch:"Electronics & Communication Eng.", openRank:7501,  closeRank:12000, examType:"JEE Main" },
  /* IIIT Delhi */
  { id:203, name:"IIIT Delhi",               shortName:"IIIT Delhi",   type:"IIIT", city:"New Delhi",   state:"Delhi",        nirfRank:29, feesPA:195000, branch:"Computer Science & Engineering",   openRank:3200,  closeRank:6800,  examType:"JEE Main" },
  { id:204, name:"IIIT Delhi",               shortName:"IIIT Delhi",   type:"IIIT", city:"New Delhi",   state:"Delhi",        nirfRank:29, feesPA:195000, branch:"Electronics & Communication Eng.", openRank:6801,  closeRank:11000, examType:"JEE Main" },
  /* IIIT Allahabad */
  { id:205, name:"IIIT Allahabad",           shortName:"IIIT Allahabad",type:"IIIT",city:"Prayagraj",   state:"Uttar Pradesh",nirfRank:33, feesPA:180000, branch:"Computer Science & Engineering",   openRank:7000,  closeRank:12500, examType:"JEE Main" },
  { id:206, name:"IIIT Allahabad",           shortName:"IIIT Allahabad",type:"IIIT",city:"Prayagraj",   state:"Uttar Pradesh",nirfRank:33, feesPA:180000, branch:"Electronics & Communication Eng.", openRank:12501, closeRank:18000, examType:"JEE Main" },
  /* IIIT Bangalore */
  { id:207, name:"IIIT Bangalore",           shortName:"IIIT Bangalore",type:"IIIT",city:"Bangalore",   state:"Karnataka",    nirfRank:35, feesPA:185000, branch:"Computer Science & Engineering",   openRank:12000, closeRank:18000, examType:"JEE Main" },
  { id:208, name:"IIIT Bangalore",           shortName:"IIIT Bangalore",type:"IIIT",city:"Bangalore",   state:"Karnataka",    nirfRank:35, feesPA:185000, branch:"Electronics & Communication Eng.", openRank:18001, closeRank:26000, examType:"JEE Main" },
  /* IIIT Pune */
  { id:209, name:"IIIT Pune",                shortName:"IIIT Pune",    type:"IIIT", city:"Pune",        state:"Maharashtra",  nirfRank:38, feesPA:170000, branch:"Computer Science & Engineering",   openRank:16000, closeRank:22000, examType:"JEE Main" },
  { id:210, name:"IIIT Pune",                shortName:"IIIT Pune",    type:"IIIT", city:"Pune",        state:"Maharashtra",  nirfRank:38, feesPA:170000, branch:"Electronics & Communication Eng.", openRank:22001, closeRank:32000, examType:"JEE Main" },
  /* IIIT Kottayam */
  { id:211, name:"IIIT Kottayam",            shortName:"IIIT Kottayam",type:"IIIT", city:"Kottayam",    state:"Kerala",       nirfRank:42, feesPA:155000, branch:"Computer Science & Engineering",   openRank:20000, closeRank:28000, examType:"JEE Main" },
  /* IIIT Lucknow */
  { id:212, name:"IIIT Lucknow",             shortName:"IIIT Lucknow", type:"IIIT", city:"Lucknow",     state:"Uttar Pradesh",nirfRank:44, feesPA:150000, branch:"Computer Science & Engineering",   openRank:22000, closeRank:30000, examType:"JEE Main" },
  /* IIIT Nagpur */
  { id:213, name:"IIIT Nagpur",              shortName:"IIIT Nagpur",  type:"IIIT", city:"Nagpur",      state:"Maharashtra",  nirfRank:46, feesPA:148000, branch:"Computer Science & Engineering",   openRank:25000, closeRank:35000, examType:"JEE Main" },
  /* IIIT Vadodara */
  { id:214, name:"IIIT Vadodara",            shortName:"IIIT Vadodara",type:"IIIT", city:"Vadodara",    state:"Gujarat",      nirfRank:48, feesPA:145000, branch:"Computer Science & Engineering",   openRank:28000, closeRank:38000, examType:"JEE Main" },
  /* IIIT Sonepat */
  { id:215, name:"IIIT Sonepat",             shortName:"IIIT Sonepat", type:"IIIT", city:"Sonepat",     state:"Haryana",      nirfRank:50, feesPA:140000, branch:"Computer Science & Engineering",   openRank:30000, closeRank:42000, examType:"JEE Main" }
];

/* ── Unique lists for filters ──────────────────────────── */
function getUniqueBranches(examType) {
  return [...new Set(
    COLLEGES.filter(c => c.examType === examType).map(c => c.branch)
  )].sort();
}
function getUniqueStates(examType) {
  return [...new Set(
    COLLEGES.filter(c => c.examType === examType).map(c => c.state)
  )].sort();
}

/* ── Core prediction function ──────────────────────────── */
function predict({ examType, rank, category, filterBranch, filterState }) {
  const multiplier = CATEGORY_MULTIPLIER[category] || 1;
  const adjustedCloseRank = c => Math.round(c.closeRank * multiplier);

  const relevant = COLLEGES.filter(c => {
    if (c.examType !== examType) return false;
    if (filterBranch && filterBranch !== 'all' && c.branch !== filterBranch) return false;
    if (filterState && filterState !== 'all' && c.state !== filterState) return false;
    return adjustedCloseRank(c) >= rank; // user qualifies
  });

  const dream   = relevant.filter(c => adjustedCloseRank(c) >= rank && adjustedCloseRank(c) <= rank * 1.35)
                           .sort((a, b) => a.closeRank - b.closeRank);
  const safe    = relevant.filter(c => adjustedCloseRank(c) > rank * 1.35)
                           .sort((a, b) => a.nirfRank - b.nirfRank);
  const topPick = relevant.filter(c => adjustedCloseRank(c) >= rank)
                           .sort((a, b) => a.nirfRank - b.nirfRank)
                           .slice(0, 10);

  return { dream, safe, topPick, total: relevant.length };
}

/* ── Utility: format fees ──────────────────────────────── */
function formatFees(n) {
  if (n >= 100000) return '₹' + (n / 100000).toFixed(1) + 'L/yr';
  return '₹' + (n / 1000).toFixed(0) + 'K/yr';
}

/* ── Render a single college card ─────────────────────── */
function renderCard(c, adjustedClose) {
  const typeBadgeClass = {IIT:'badge-iit', NIT:'badge-nit', IIIT:'badge-iiit', GFTI:'badge-gfti'}[c.type] || '';
  return `
    <div class="college-card">
      <div class="cc-header">
        <div>
          <span class="cc-badge ${typeBadgeClass}">${c.type}</span>
          <h3 class="cc-name">${c.shortName}</h3>
          <p class="cc-branch">${c.branch}</p>
          <p class="cc-location">📍 ${c.city}, ${c.state}</p>
        </div>
        <div class="cc-nirf">
          <span class="nirf-num">#${c.nirfRank}</span>
          <span class="nirf-label">NIRF</span>
        </div>
      </div>
      <div class="cc-stats">
        <div class="cc-stat">
          <span class="cs-label">Opening Rank</span>
          <span class="cs-val">${c.openRank.toLocaleString()}</span>
        </div>
        <div class="cc-stat">
          <span class="cs-label">Closing Rank</span>
          <span class="cs-val highlight">${adjustedClose.toLocaleString()}</span>
        </div>
        <div class="cc-stat">
          <span class="cs-label">Annual Fees</span>
          <span class="cs-val">${formatFees(c.feesPA)}</span>
        </div>
      </div>
    </div>`;
}

/* ── Render results grid ───────────────────────────────── */
function renderGrid(list, multiplier) {
  if (!list.length) return '<p class="no-results">No colleges found for this category. Try adjusting your filters.</p>';
  return list.map(c => renderCard(c, Math.round(c.closeRank * multiplier))).join('');
}

/* ── Main prediction handler ───────────────────────────── */
function handlePredict(event) {
  if (event) event.preventDefault();

  const examType   = document.querySelector('input[name="examType"]:checked')?.value || 'JEE Main';
  const inputMode  = document.querySelector('input[name="inputMode"]:checked')?.value || 'rank';
  let rank         = parseInt(document.getElementById('rankInput').value, 10);
  const category   = document.getElementById('categorySelect').value || 'general';
  const filterBranch = document.getElementById('branchFilter')?.value || 'all';
  const filterState  = document.getElementById('stateFilter')?.value || 'all';

  if (inputMode === 'percentile') {
    const pct = parseFloat(document.getElementById('rankInput').value);
    if (isNaN(pct) || pct < 0 || pct > 100) {
      showError('Please enter a valid percentile between 0 and 100.');
      return;
    }
    rank = percentileToRank(pct);
  } else {
    if (isNaN(rank) || rank < 1) {
      showError('Please enter a valid rank.');
      return;
    }
  }

  const multiplier = CATEGORY_MULTIPLIER[category] || 1;
  const results    = predict({ examType, rank, category, filterBranch, filterState });

  /* Show results section */
  const sec = document.getElementById('results');
  sec.style.display = 'block';
  sec.scrollIntoView({ behavior: 'smooth', block: 'start' });

  /* Summary */
  document.getElementById('resultsSummary').innerHTML =
    `Showing <strong>${results.total}</strong> colleges for <strong>${examType}</strong> rank <strong>${rank.toLocaleString()}</strong> (${category.toUpperCase()})`;

  /* Populate tabs */
  document.getElementById('tab-dream').innerHTML   = renderGrid(results.dream, multiplier);
  document.getElementById('tab-safe').innerHTML    = renderGrid(results.safe, multiplier);
  document.getElementById('tab-toppick').innerHTML = renderGrid(results.topPick, multiplier);

  /* Badge counts */
  document.getElementById('cnt-dream').textContent   = results.dream.length;
  document.getElementById('cnt-safe').textContent    = results.safe.length;
  document.getElementById('cnt-toppick').textContent = results.topPick.length;

  /* Activate first tab */
  switchTab('dream');

  /* Populate filter selects for results */
  populateResultFilters(examType);

  /* Store last query for filters */
  window._lastQuery = { examType, rank, category };
}

/* ── Populate branch/state filter dropdowns ──────────────*/
function populateResultFilters(examType) {
  const branches = getUniqueBranches(examType);
  const states   = getUniqueStates(examType);

  const branchSel = document.getElementById('branchFilter');
  const stateSel  = document.getElementById('stateFilter');

  if (branchSel) {
    branchSel.innerHTML = '<option value="all">All Branches</option>' +
      branches.map(b => `<option value="${b}">${b}</option>`).join('');
  }
  if (stateSel) {
    stateSel.innerHTML = '<option value="all">All States</option>' +
      states.map(s => `<option value="${s}">${s}</option>`).join('');
  }
}

/* ── Filter change handler ────────────────────────────── */
function handleFilterChange() {
  if (!window._lastQuery) return;
  handlePredict(null);
}

/* ── Tab switching ────────────────────────────────────── */
function switchTab(name) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab-panel').forEach(p => p.style.display = 'none');
  const btn = document.querySelector(`[data-tab="${name}"]`);
  const pnl = document.getElementById(`tab-${name}`);
  if (btn) btn.classList.add('active');
  if (pnl) pnl.style.display = 'grid';
}

/* ── Input mode toggle (Rank / Percentile) ────────────── */
function handleInputModeChange() {
  const mode = document.querySelector('input[name="inputMode"]:checked')?.value;
  const input  = document.getElementById('rankInput');
  const label  = document.getElementById('rankInputLabel');
  if (mode === 'percentile') {
    input.placeholder = 'e.g. 98.5';
    input.min = '0'; input.max = '100'; input.step = '0.01';
    if (label) label.textContent = 'Your Percentile';
  } else {
    input.placeholder = 'e.g. 15000';
    input.min = '1'; input.max = ''; input.step = '1';
    if (label) label.textContent = 'Your Rank';
  }
}

/* ── Exam type change → update branch filter ─────────── */
function handleExamTypeChange() {
  const examType = document.querySelector('input[name="examType"]:checked')?.value || 'JEE Main';
  populateResultFilters(examType);
}

/* ── Error display ─────────────────────────────────────── */
function showError(msg) {
  const el = document.getElementById('formError');
  if (el) { el.textContent = msg; el.style.display = 'block'; }
  else alert(msg);
  setTimeout(() => { if (el) el.style.display = 'none'; }, 4000);
}

/* ── PDF Download (print) ─────────────────────────────── */
function downloadPDF() {
  window.print();
}

/* ── Share functionality ──────────────────────────────── */
async function shareResults() {
  const q = window._lastQuery;
  if (!q) return;
  const text = `JEE College Predictor 2026 – My rank: ${q.rank.toLocaleString()} (${q.category.toUpperCase()}, ${q.examType}). Check your colleges at ${window.location.href}`;
  if (navigator.share) {
    try { await navigator.share({ title: 'JEE College Predictor 2026', text, url: window.location.href }); return; }
    catch (_) { /* fallthrough */ }
  }
  await navigator.clipboard.writeText(text).catch(() => {});
  const btn = document.getElementById('shareBtn');
  if (btn) { btn.textContent = '✅ Copied!'; setTimeout(() => btn.textContent = '🔗 Share Results', 2000); }
}

/* ── DOM Ready: wire up events ────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('predictorForm');
  if (form) form.addEventListener('submit', handlePredict);

  document.querySelectorAll('input[name="inputMode"]').forEach(r =>
    r.addEventListener('change', handleInputModeChange));
  document.querySelectorAll('input[name="examType"]').forEach(r =>
    r.addEventListener('change', handleExamTypeChange));

  document.querySelectorAll('.tab-btn').forEach(btn =>
    btn.addEventListener('click', () => switchTab(btn.dataset.tab)));

  const branchF = document.getElementById('branchFilter');
  const stateF  = document.getElementById('stateFilter');
  if (branchF) branchF.addEventListener('change', handleFilterChange);
  if (stateF)  stateF.addEventListener('change', handleFilterChange);

  const dlBtn   = document.getElementById('downloadBtn');
  const shareB  = document.getElementById('shareBtn');
  if (dlBtn)  dlBtn.addEventListener('click', downloadPDF);
  if (shareB) shareB.addEventListener('click', shareResults);

  /* Initialise filters for default exam type */
  populateResultFilters('JEE Main');
});
