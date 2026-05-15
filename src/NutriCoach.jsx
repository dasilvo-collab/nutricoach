import { useState, useEffect, useCallback } from "react";

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');
  *{margin:0;padding:0;box-sizing:border-box;}
  :root{
    --bg:#0f0f0f;--s1:#1a1a1a;--s2:#222;--s3:#2a2a2a;--s4:#363636;
    --t:#f0ede8;--tm:#888;--td:#444;
    --ac:#c8f055;--acb:rgba(200,240,85,.1);
    --re:#ff5c5c;--or:#ff9a3c;--bl:#5cb8ff;
    --r:12px;--rs:8px;
  }
  body{font-family:'DM Sans',sans-serif;background:var(--bg);color:var(--t);font-size:14px;line-height:1.6;}
  button{font-family:'DM Sans',sans-serif;cursor:pointer;}
  input,select,textarea{font-family:'DM Sans',sans-serif;}
  ::-webkit-scrollbar{width:5px;}::-webkit-scrollbar-track{background:var(--s1);}::-webkit-scrollbar-thumb{background:var(--s4);border-radius:3px;}
  .syne{font-family:'Syne',sans-serif;}
`;

// ─── DATA ─────────────────────────────────────────────────────────────────────
const MACROS = {
  repos:    { kc:2000, pr:160, gl:180, li:70,  lbl:"Repos" },
  training: { kc:2500, pr:170, gl:280, li:75,  lbl:"Entraînement" },
  long:     { kc:2700, pr:175, gl:320, li:75,  lbl:"Sortie longue" },
};

const DEFAULT_CONVS = [
  { id:"moi",    name:"Moi",         emoji:"👨", coeff:1.00, fixed:true  },
  { id:"femme",  name:"Une femme",   emoji:"👩", coeff:0.85, fixed:false },
  { id:"gaston", name:"Gaston 5a",   emoji:"👶", coeff:0.45, fixed:false },
  { id:"marius", name:"Marius 10a",  emoji:"🧒", coeff:0.70, fixed:false },
  { id:"jules",  name:"Jules 14a",   emoji:"👦", coeff:0.90, fixed:false },
];

const CONTEXTS = {
  home:  { icon:"🏠", label:"Maison",     color:"var(--tm)" },
  self:  { icon:"🏢", label:"Self",       color:"var(--bl)" },
  resto: { icon:"🍽️", label:"Restaurant", color:"var(--or)" },
  fun:   { icon:"🎉", label:"Fun !",      color:"var(--ac)" },
};

const DAYS = ["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"];
const SLOTS = [
  { k:"b", icon:"🌅", label:"Matin" },
  { k:"l", icon:"☀️", label:"Midi" },
  { k:"d", icon:"🌙", label:"Soir" },
];
const TODAY_IDX = (new Date().getDay() + 6) % 7;

const REC = {
  breakfast: [
    { id:"b1", n:"Bowl avoine jambon", d:"Flocons d'avoine {50g}, fromage blanc 0% {200g}, myrtilles {80g}, noix {20g}, jambon {2tr}", kc:490, pr:36, gl:54, li:14, t:"🥣 5 min", tags:["sucré-salé","bowl","rapide"], ing:[{n:"Flocons d'avoine",base:50,u:"g"},{n:"Fromage blanc 0%",base:200,u:"g"},{n:"Myrtilles surgelées",base:80,u:"g"},{n:"Noix",base:20,u:"g"},{n:"Jambon blanc",base:60,u:"g"}] },
    { id:"b2", n:"Tartines seigle saumon", d:"Pain seigle {2tr}, saumon fumé {80g}, fromage blanc 0% {100g}, citron", kc:430, pr:32, gl:42, li:12, t:"🍞 5 min", tags:["saumon","tartines","rapide"], ing:[{n:"Pain de seigle",base:80,u:"g"},{n:"Saumon fumé",base:80,u:"g"},{n:"Fromage blanc 0%",base:100,u:"g"}] },
    { id:"b3", n:"Omelette jambon herbes", d:"Oeufs {3}, jambon blanc {80g}, herbes fraîches, fromage blanc 0% {100g}", kc:400, pr:40, gl:6, li:22, t:"🍳 10 min", tags:["chaud","oeufs","jambon"], ing:[{n:"Oeufs",base:3,u:""},{n:"Jambon blanc",base:80,u:"g"},{n:"Fromage blanc 0%",base:100,u:"g"}] },
    { id:"b4", n:"Yaourt grec bowl myrtilles", d:"Yaourt grec {200g}, flocons d'avoine {40g}, myrtilles {100g}, amandes {15g}", kc:355, pr:24, gl:42, li:10, t:"🥣 3 min", tags:["bowl","rapide","yaourt"], ing:[{n:"Yaourt grec",base:200,u:"g"},{n:"Flocons d'avoine",base:40,u:"g"},{n:"Myrtilles surgelées",base:100,u:"g"},{n:"Amandes",base:15,u:"g"}] },
    { id:"b5", n:"Oeufs brouillés saumon", d:"Oeufs {3}, saumon fumé {60g}, ciboulette, fromage blanc 0% {80g}", kc:420, pr:38, gl:8, li:24, t:"🍳 10 min", tags:["chaud","saumon","oeufs"], ing:[{n:"Oeufs",base:3,u:""},{n:"Saumon fumé",base:60,u:"g"},{n:"Fromage blanc 0%",base:80,u:"g"}] },
    { id:"b6", n:"Bowl protéiné thon avocat", d:"Thon {80g}, avocat {60g}, fromage blanc 0% {150g}, flocons d'avoine {40g}, citron", kc:445, pr:36, gl:38, li:16, t:"🥣 5 min", tags:["thon","avocat","bowl"], ing:[{n:"Thon naturel",base:80,u:"g"},{n:"Avocat",base:60,u:"g"},{n:"Fromage blanc 0%",base:150,u:"g"},{n:"Flocons d'avoine",base:40,u:"g"}] },
    { id:"b7", n:"Tartines seigle jambon fromage blanc", d:"Pain seigle {2tr}, jambon blanc {80g}, fromage blanc 0% {150g}, myrtilles {80g}, noix {15g}, flocons d'avoine {30g}", kc:510, pr:38, gl:52, li:14, t:"🍞 5 min", tags:["tartines","jambon","favori"], ing:[{n:"Pain de seigle",base:80,u:"g"},{n:"Jambon blanc",base:80,u:"g"},{n:"Fromage blanc 0%",base:150,u:"g"},{n:"Myrtilles surgelées",base:80,u:"g"},{n:"Noix",base:15,u:"g"},{n:"Flocons d'avoine",base:30,u:"g"}] },
  ],
  lunch_train: [
    { id:"lt1", n:"Bowl poulet quinoa", d:"Poulet rôti {160g}, quinoa {120g cuit}, courgettes rôties {120g}, vinaigrette moutarde", kc:530, pr:46, gl:54, li:13, t:"🏃 Batchable", tags:["poulet","quinoa","bowl"], ing:[{n:"Poulet (cuit)",base:160,u:"g"},{n:"Quinoa",base:60,u:"g sec"},{n:"Courgettes",base:120,u:"g"}] },
    { id:"lt2", n:"Salade niçoise thon", d:"Thon {120g}, oeufs durs {2}, haricots verts {120g}, tomates {100g}, olives {20g}", kc:480, pr:42, gl:20, li:22, t:"🥗 Self", tags:["thon","salade","oeufs"], ing:[{n:"Thon naturel",base:120,u:"g"},{n:"Oeufs",base:2,u:""},{n:"Haricots verts",base:120,u:"g"},{n:"Tomates cerises",base:100,u:"g"}] },
    { id:"lt3", n:"Saumon lentilles épinards", d:"Pavé saumon {150g}, lentilles {120g cuites}, épinards sautés {100g}", kc:540, pr:46, gl:40, li:16, t:"🐟 Batchable", tags:["saumon","lentilles","épinards"], ing:[{n:"Saumon",base:150,u:"g"},{n:"Lentilles vertes",base:55,u:"g sec"},{n:"Épinards frais",base:100,u:"g"}] },
    { id:"lt4", n:"Poulet riz haricots verts", d:"Escalope poulet {160g}, riz complet {120g cuit}, haricots verts {120g}", kc:500, pr:44, gl:52, li:10, t:"🍗 Self · Batch", tags:["poulet","riz","haricots"], ing:[{n:"Poulet (cuit)",base:160,u:"g"},{n:"Riz complet",base:50,u:"g sec"},{n:"Haricots verts",base:120,u:"g"}] },
    { id:"lt5", n:"Steak haché lentilles salade", d:"Steak haché 5% {150g}, lentilles {120g cuites}, salade verte {60g}", kc:520, pr:46, gl:38, li:16, t:"🥩 Batchable", tags:["boeuf","lentilles","salade"], ing:[{n:"Steak haché 5%",base:150,u:"g"},{n:"Lentilles vertes",base:55,u:"g sec"},{n:"Salade verte",base:60,u:"g"}] },
    { id:"lt6", n:"Crevettes quinoa courgettes", d:"Crevettes {150g}, quinoa {120g cuit}, courgettes sautées {120g}, citron", kc:475, pr:42, gl:50, li:10, t:"🍤 15 min", tags:["crevettes","quinoa","courgettes"], ing:[{n:"Crevettes cuites",base:150,u:"g"},{n:"Quinoa",base:60,u:"g sec"},{n:"Courgettes",base:120,u:"g"}] },
    { id:"lt7", n:"Poulet curry doux riz", d:"Poulet {160g}, riz basmati {120g cuit}, sauce curry doux {60ml}, épinards {80g}", kc:545, pr:46, gl:58, li:12, t:"🍗 20 min", tags:["poulet","curry","riz"], ing:[{n:"Poulet (cuit)",base:160,u:"g"},{n:"Riz basmati",base:50,u:"g sec"},{n:"Épinards frais",base:80,u:"g"}] },
    { id:"lt8", n:"Bowl boeuf haché quinoa", d:"Steak haché 5% {150g}, quinoa {120g cuit}, tomates cerises {100g}, herbes", kc:530, pr:46, gl:44, li:16, t:"🥩 20 min", tags:["boeuf","quinoa","tomates"], ing:[{n:"Steak haché 5%",base:150,u:"g"},{n:"Quinoa",base:60,u:"g sec"},{n:"Tomates cerises",base:100,u:"g"}] },
    { id:"lt9", n:"Salade saumon avocat", d:"Pavé saumon {150g} froid, avocat {80g}, salade verte {80g}, tomates {80g}, vinaigrette citron", kc:490, pr:40, gl:12, li:28, t:"🥗 15 min", tags:["saumon","avocat","salade"], ing:[{n:"Saumon",base:150,u:"g"},{n:"Avocat",base:80,u:"g"},{n:"Salade verte",base:80,u:"g"}] },
    { id:"lt10", n:"Filet porc patates douces", d:"Filet mignon porc {150g}, patates douces {130g}, haricots verts {100g}", kc:510, pr:44, gl:44, li:12, t:"🥩 Batchable", tags:["porc","patate douce","haricots"], ing:[{n:"Filet mignon de porc",base:150,u:"g"},{n:"Patates douces",base:130,u:"g"},{n:"Haricots verts",base:100,u:"g"}] },
    { id:"lt11", n:"Thon pâtes complètes", d:"Thon {120g}, pâtes complètes {120g cuites}, tomates cerises {100g}, ail, huile olive", kc:520, pr:42, gl:56, li:12, t:"🐟 15 min", tags:["thon","pâtes","tomates"], ing:[{n:"Thon naturel",base:120,u:"g"},{n:"Pâtes complètes",base:50,u:"g sec"},{n:"Tomates cerises",base:100,u:"g"}] },
    { id:"lt12", n:"Poulet taboulé maison", d:"Poulet {150g}, semoule {100g cuite}, tomates {80g}, concombre {80g}, herbes fraîches, citron", kc:505, pr:44, gl:52, li:10, t:"🍗 Batchable", tags:["poulet","taboulé","frais"], ing:[{n:"Poulet (cuit)",base:150,u:"g"},{n:"Semoule",base:45,u:"g sec"},{n:"Tomates cerises",base:80,u:"g"},{n:"Concombre",base:80,u:"g"}] },
  ],
  lunch_repos: [
    { id:"lr1", n:"Poulet salade verte complète", d:"Escalope poulet {160g}, salade verte {80g}, tomates {100g}, oeuf dur {1}", kc:380, pr:44, gl:10, li:16, t:"😴 Self", tags:["poulet","salade","oeufs"], ing:[{n:"Poulet (cuit)",base:160,u:"g"},{n:"Salade verte",base:80,u:"g"},{n:"Oeufs",base:1,u:""}] },
    { id:"lr2", n:"Salade thon oeufs olives", d:"Thon {120g}, oeufs durs {2}, haricots verts {100g}, olives {20g}, salade", kc:400, pr:40, gl:12, li:20, t:"😴 Self", tags:["thon","oeufs","olives"], ing:[{n:"Thon naturel",base:120,u:"g"},{n:"Oeufs",base:2,u:""},{n:"Haricots verts",base:100,u:"g"}] },
    { id:"lr3", n:"Omelette champignons épinards", d:"Oeufs {4}, champignons {100g}, épinards {80g}, herbes de Provence", kc:355, pr:30, gl:8, li:22, t:"😴 15 min", tags:["oeufs","champignons","épinards"], ing:[{n:"Oeufs",base:4,u:""},{n:"Champignons",base:100,u:"g"},{n:"Épinards frais",base:80,u:"g"}] },
    { id:"lr4", n:"Saumon épinards ail", d:"Pavé saumon {150g}, épinards sautés {150g}, ail, huile olive", kc:375, pr:40, gl:6, li:18, t:"😴 15 min", tags:["saumon","épinards","ail"], ing:[{n:"Saumon",base:150,u:"g"},{n:"Épinards frais",base:150,u:"g"}] },
    { id:"lr5", n:"Assiette boeuf crudités", d:"Steak haché 5% {160g}, carottes {80g}, concombre {80g}, tomates {80g}, vinaigrette légère", kc:380, pr:40, gl:14, li:18, t:"😴 10 min", tags:["boeuf","crudités","léger"], ing:[{n:"Steak haché 5%",base:160,u:"g"},{n:"Carottes",base:80,u:"g"},{n:"Concombre",base:80,u:"g"}] },
    { id:"lr6", n:"Poulet avocat salade", d:"Poulet {160g}, avocat {80g}, salade verte {80g}, citron, coriandre", kc:400, pr:44, gl:8, li:20, t:"😴 10 min", tags:["poulet","avocat","salade"], ing:[{n:"Poulet (cuit)",base:160,u:"g"},{n:"Avocat",base:80,u:"g"},{n:"Salade verte",base:80,u:"g"}] },
    { id:"lr7", n:"Thon avocat salade", d:"Thon {120g}, avocat {80g}, salade verte {80g}, tomates {80g}, vinaigrette citron", kc:390, pr:38, gl:10, li:22, t:"😴 5 min", tags:["thon","avocat","salade"], ing:[{n:"Thon naturel",base:120,u:"g"},{n:"Avocat",base:80,u:"g"},{n:"Salade verte",base:80,u:"g"}] },
  ],
  dinner_train: [
    { id:"dt1", n:"Saumon patate douce brocolis", d:"Pavé saumon {160g}, patate douce {150g} rôtie, brocolis {150g} vapeur", kc:570, pr:44, gl:52, li:18, t:"🏃 Batchable", tags:["saumon","patate douce","brocolis"], ing:[{n:"Saumon",base:160,u:"g"},{n:"Patates douces",base:150,u:"g"},{n:"Brocolis",base:150,u:"g"}] },
    { id:"dt2", n:"Poulet rôti légumes four", d:"Cuisse poulet {180g}, courgettes {150g}, carottes {100g}, tomates {80g}, herbes Provence", kc:445, pr:48, gl:20, li:18, t:"🍗 Batchable", tags:["poulet","courgettes","four"], ing:[{n:"Poulet (cuit)",base:180,u:"g"},{n:"Courgettes",base:150,u:"g"},{n:"Carottes",base:100,u:"g"}] },
    { id:"dt3", n:"Boeuf haché quinoa épinards", d:"Steak haché 5% {150g}, quinoa {100g cuit}, épinards {100g}, tomates cerises {80g}", kc:555, pr:46, gl:42, li:18, t:"🥩 20 min", tags:["boeuf","quinoa","épinards"], ing:[{n:"Steak haché 5%",base:150,u:"g"},{n:"Quinoa",base:45,u:"g sec"},{n:"Épinards frais",base:100,u:"g"}] },
    { id:"dt4", n:"Filet de porc légumes", d:"Filet mignon porc {160g} rôti, pommes de terre {120g}, haricots verts {120g}", kc:520, pr:44, gl:42, li:14, t:"🥩 Batchable", tags:["porc","pommes de terre","haricots"], ing:[{n:"Filet mignon de porc",base:160,u:"g"},{n:"Pommes de terre",base:120,u:"g"},{n:"Haricots verts",base:120,u:"g"}] },
    { id:"dt5", n:"Crevettes sautées riz jasmin", d:"Crevettes {180g}, riz jasmin {100g cuit}, courgettes {100g}, ail, citron", kc:480, pr:40, gl:52, li:10, t:"🍤 15 min", tags:["crevettes","riz","courgettes"], ing:[{n:"Crevettes cuites",base:180,u:"g"},{n:"Riz jasmin",base:45,u:"g sec"},{n:"Courgettes",base:100,u:"g"}] },
    { id:"dt6", n:"Thon steak légumes grillés", d:"Steak de thon {160g}, courgettes {120g} grillées, tomates {100g}, herbes, huile olive", kc:390, pr:44, gl:14, li:14, t:"🐟 20 min", tags:["thon","courgettes","grillé"], ing:[{n:"Thon frais",base:160,u:"g"},{n:"Courgettes",base:120,u:"g"},{n:"Tomates cerises",base:100,u:"g"}] },
    { id:"dt7", n:"Poulet lemon grass patates douces", d:"Poulet {180g}, patates douces {140g}, brocolis {100g}, citron, thym", kc:490, pr:48, gl:44, li:12, t:"🍗 Batchable", tags:["poulet","patate douce","citron"], ing:[{n:"Poulet (cuit)",base:180,u:"g"},{n:"Patates douces",base:140,u:"g"},{n:"Brocolis",base:100,u:"g"}] },
    { id:"dt8", n:"Saumon lentilles corail", d:"Pavé saumon {160g}, lentilles corail {120g cuites}, épinards {80g}, cumin", kc:540, pr:46, gl:38, li:18, t:"🐟 20 min", tags:["saumon","lentilles","épices"], ing:[{n:"Saumon",base:160,u:"g"},{n:"Lentilles corail",base:55,u:"g sec"},{n:"Épinards frais",base:80,u:"g"}] },
    { id:"dt9", n:"Boeuf haché riz complet", d:"Steak haché 5% {150g}, riz complet {110g cuit}, haricots verts {100g}, sauce tomate {50ml}", kc:520, pr:44, gl:48, li:14, t:"🥩 20 min", tags:["boeuf","riz","haricots"], ing:[{n:"Steak haché 5%",base:150,u:"g"},{n:"Riz complet",base:50,u:"g sec"},{n:"Haricots verts",base:100,u:"g"}] },
    { id:"dt10", n:"Poulet tikka massala léger", d:"Poulet {180g}, sauce tikka légère {80ml}, riz basmati {100g cuit}, coriandre", kc:530, pr:48, gl:52, li:12, t:"🍗 25 min", tags:["poulet","curry","épices"], ing:[{n:"Poulet (cuit)",base:180,u:"g"},{n:"Riz basmati",base:45,u:"g sec"}] },
    { id:"dt11", n:"Tataki de thon quinoa", d:"Thon {160g} mi-cuit sésame, quinoa {100g cuit}, concombre {80g}, sauce soja légère", kc:480, pr:46, gl:40, li:14, t:"🐟 15 min", tags:["thon","quinoa","japonais"], ing:[{n:"Thon frais",base:160,u:"g"},{n:"Quinoa",base:45,u:"g sec"},{n:"Concombre",base:80,u:"g"}] },
    { id:"dt12", n:"Porc caramélisé légumes", d:"Filet porc {160g}, carottes {100g}, courgettes {120g}, miel {10g}, sauce soja {15ml}", kc:490, pr:44, gl:30, li:14, t:"🥩 25 min", tags:["porc","carottes","sucré-salé"], ing:[{n:"Filet mignon de porc",base:160,u:"g"},{n:"Carottes",base:100,u:"g"},{n:"Courgettes",base:120,u:"g"}] },
  ],
  dinner_repos: [
    { id:"dr1", n:"Poulet citron thym légumes", d:"Escalope poulet {180g}, courgettes {150g}, carottes {80g}, citron, thym", kc:395, pr:48, gl:14, li:16, t:"😴 Batchable", tags:["poulet","courgettes","citron"], ing:[{n:"Poulet (cuit)",base:180,u:"g"},{n:"Courgettes",base:150,u:"g"},{n:"Carottes",base:80,u:"g"}] },
    { id:"dr2", n:"Saumon papillote légumes", d:"Pavé saumon {160g}, carottes {100g}, haricots verts {120g}, citron-herbes", kc:370, pr:40, gl:14, li:16, t:"😴 15 min four", tags:["saumon","carottes","haricots"], ing:[{n:"Saumon",base:160,u:"g"},{n:"Carottes",base:100,u:"g"},{n:"Haricots verts",base:120,u:"g"}] },
    { id:"dr3", n:"Omelette 4 oeufs champignons", d:"Oeufs {4}, champignons {120g}, épinards {80g}, ciboulette", kc:355, pr:30, gl:8, li:22, t:"😴 10 min", tags:["oeufs","champignons","épinards"], ing:[{n:"Oeufs",base:4,u:""},{n:"Champignons",base:120,u:"g"},{n:"Épinards frais",base:80,u:"g"}] },
    { id:"dr4", n:"Steak haché salade moutarde", d:"Steak haché 5% {160g}, salade verte {80g}, tomates {100g}, moutarde", kc:395, pr:42, gl:8, li:20, t:"😴 10 min", tags:["boeuf","salade","moutarde"], ing:[{n:"Steak haché 5%",base:160,u:"g"},{n:"Salade verte",base:80,u:"g"},{n:"Tomates cerises",base:100,u:"g"}] },
    { id:"dr5", n:"Thon poêlé légumes provençaux", d:"Steak de thon {160g}, courgettes {150g}, tomates {100g}, herbes, huile olive", kc:375, pr:44, gl:12, li:14, t:"😴 20 min", tags:["thon","courgettes","provençal"], ing:[{n:"Thon frais",base:160,u:"g"},{n:"Courgettes",base:150,u:"g"},{n:"Tomates cerises",base:100,u:"g"}] },
    { id:"dr6", n:"Poulet vapeur brocolis", d:"Escalope poulet {180g}, brocolis {150g} vapeur, citron, fleur de sel", kc:350, pr:48, gl:10, li:12, t:"😴 15 min", tags:["poulet","brocolis","vapeur"], ing:[{n:"Poulet (cuit)",base:180,u:"g"},{n:"Brocolis",base:150,u:"g"}] },
    { id:"dr7", n:"Saumon grillé épinards ail", d:"Pavé saumon {160g} grillé, épinards {150g} sautés ail, huile olive, citron", kc:385, pr:42, gl:6, li:20, t:"😴 15 min", tags:["saumon","épinards","ail"], ing:[{n:"Saumon",base:160,u:"g"},{n:"Épinards frais",base:150,u:"g"}] },
    { id:"dr8", n:"Boeuf haché courgettes", d:"Steak haché 5% {160g}, courgettes {180g} sautées, tomates cerises {80g}, basilic", kc:390, pr:42, gl:12, li:18, t:"😴 15 min", tags:["boeuf","courgettes","basilic"], ing:[{n:"Steak haché 5%",base:160,u:"g"},{n:"Courgettes",base:180,u:"g"},{n:"Tomates cerises",base:80,u:"g"}] },
    { id:"dr9", n:"Porc grillé haricots verts", d:"Filet porc {160g}, haricots verts {150g}, moutarde à l'ancienne, citron", kc:380, pr:44, gl:12, li:14, t:"😴 15 min", tags:["porc","haricots","moutarde"], ing:[{n:"Filet mignon de porc",base:160,u:"g"},{n:"Haricots verts",base:150,u:"g"}] },
    { id:"dr10", n:"Thon cru style tartare", d:"Thon frais {160g} coupé en dés, concombre {100g}, citron vert, gingembre, sésame", kc:320, pr:44, gl:8, li:10, t:"😴 10 min", tags:["thon","cru","léger"], ing:[{n:"Thon frais",base:160,u:"g"},{n:"Concombre",base:100,u:"g"}] },
  ],
  fun: {
    b: [
      { id:"fb1", n:"Toast avocat oeuf saumon", d:"Pain brioche {2tr}, avocat {80g}, oeuf poché {1}, saumon fumé {60g}", kc:510, pr:32, gl:42, li:22, t:"🎉 10 min", tags:["fun","avocat","saumon"], ing:[{n:"Saumon fumé",base:60,u:"g"},{n:"Avocat",base:80,u:"g"},{n:"Oeufs",base:1,u:""}] },
      { id:"fb2", n:"Pancakes protéinés myrtilles", d:"Flocons d'avoine mixés {80g}, oeufs {2}, fromage blanc {150g}, myrtilles {100g}", kc:490, pr:30, gl:56, li:12, t:"🎉 15 min", tags:["fun","pancakes","myrtilles"], ing:[{n:"Flocons d'avoine",base:80,u:"g"},{n:"Oeufs",base:2,u:""},{n:"Fromage blanc 0%",base:150,u:"g"}] },
    ],
    l: [
      { id:"fl1", n:"Burger boeuf maison", d:"Pain brioche, steak haché {150g}, cheddar, salade, tomate, cornichons", kc:620, pr:44, gl:52, li:22, t:"🎉 15 min", tags:["fun","burger","boeuf"], ing:[{n:"Steak haché 5%",base:150,u:"g"}] },
      { id:"fl2", n:"Wrap poulet avocat", d:"Tortilla, poulet grillé {140g}, avocat, tomates cerises, sauce yaourt", kc:540, pr:40, gl:54, li:16, t:"🎉 10 min", tags:["fun","wrap","poulet"], ing:[{n:"Poulet (cuit)",base:140,u:"g"},{n:"Avocat",base:70,u:"g"}] },
      { id:"fl3", n:"Salade César poulet", d:"Poulet {160g}, salade romaine, parmesan {20g}, croûtons {30g}, sauce César légère", kc:560, pr:46, gl:36, li:22, t:"🎉 15 min", tags:["fun","césar","poulet"], ing:[{n:"Poulet (cuit)",base:160,u:"g"}] },
    ],
    d: [
      { id:"fd1", n:"Côte de boeuf patates douces", d:"Entrecôte {200g}, patates douces {150g} frites four, salade, beurre herbes", kc:680, pr:46, gl:48, li:28, t:"🎉 30 min", tags:["fun","boeuf","fête"], ing:[{n:"Boeuf entrecôte",base:200,u:"g"},{n:"Patates douces",base:150,u:"g"}] },
      { id:"fd2", n:"Tataki saumon riz japonais", d:"Saumon {180g} sésame-soja, riz japonais {100g cuit}, concombre {80g}, sauce ponzu", kc:590, pr:46, gl:54, li:18, t:"🎉 20 min", tags:["fun","saumon","japonais"], ing:[{n:"Saumon",base:180,u:"g"},{n:"Concombre",base:80,u:"g"}] },
      { id:"fd3", n:"Poulet farci herbes citron", d:"Poulet {200g}, farce herbes-citron, jus réduit, courgettes rôties", kc:560, pr:50, gl:22, li:26, t:"🎉 45 min four", tags:["fun","poulet","festif"], ing:[{n:"Poulet (cuit)",base:200,u:"g"},{n:"Courgettes",base:150,u:"g"}] },
      { id:"fd4", n:"Crevettes flambées riz sauvage", d:"Crevettes {200g}, riz sauvage {100g cuit}, beurre citron {15g}, persil", kc:520, pr:42, gl:48, li:16, t:"🎉 20 min", tags:["fun","crevettes","festif"], ing:[{n:"Crevettes cuites",base:200,u:"g"}] },
    ],
  },
};

// ─── PETIT-DÉJEUNERS FIXES ────────────────────────────────────────────────────
const FIXED_BREAKFASTS = [
  {
    id: "fb_tartines_jambon_favori",
    name: "Tartines seigle jambon — Mon favori ⭐",
    n: "Tartines seigle jambon — Mon favori ⭐",
    emoji: "⭐",
    subtitle: "Ma routine signature",
    d: "Pain seigle {2 tartines}, beurre {10g}, jambon blanc {80g}, fromage blanc 0% {150g}, myrtilles {80g}, noix {15g}, flocons d'avoine {30g}",
    prep: "Tartines seigle beurrées légèrement + jambon. Bowl à côté : fromage blanc + flocons + myrtilles + noix.",
    kc: 585, pr: 38, gl: 52, li: 22,
    ing: [{n:"Pain de seigle",base:80,u:"g"},{n:"Beurre",base:10,u:"g"},{n:"Jambon blanc",base:80,u:"g"},{n:"Fromage blanc 0%",base:150,u:"g"},{n:"Myrtilles surgelées",base:80,u:"g"},{n:"Noix",base:15,u:"g"},{n:"Flocons d'avoine",base:30,u:"g"}],
    tips: ["Beurre sorti du frigo 10 min avant pour tartiner facilement", "1 noisette de beurre par tartine suffit — pas besoin d'en mettre beaucoup", "Préparer le bowl la veille au frigo"],
    tags: ["favori","tartines","jambon","beurre"],
  },
  {
    id: "fb_jambon_bowl",
    name: "Bowl Jambon & Fromage blanc",
    n: "Bowl Jambon & Fromage blanc",
    emoji: "🥩",
    subtitle: "La routine protéinée rapide",
    d: "Fromage blanc 0% {200g}, flocons d'avoine {50g}, jambon blanc {2tr}, myrtilles {80g}, noix {15g}",
    prep: "Fromage blanc + flocons dans un bol. Jambon à côté. Myrtilles et noix par-dessus.",
    kc: 490, pr: 38, gl: 52, li: 13,
    ing: [{n:"Fromage blanc 0%",base:200,u:"g"},{n:"Flocons d'avoine",base:50,u:"g"},{n:"Jambon blanc",base:60,u:"g"},{n:"Myrtilles surgelées",base:80,u:"g"},{n:"Noix",base:15,u:"g"}],
    tips: ["Préparer la veille en box", "Sortir les myrtilles la veille du congélateur"],
    tags: ["jambon","bowl","rapide"],
  },
  {
    id: "fb_saumon_fb",
    name: "Saumon fumé & Fromage blanc",
    n: "Saumon fumé & Fromage blanc",
    emoji: "🐟",
    subtitle: "La version oméga-3",
    d: "Fromage blanc 0% {200g}, flocons d'avoine {50g}, saumon fumé {60g}, myrtilles {80g}, amandes {15g}",
    prep: "Fromage blanc + flocons dans un bol. Saumon fumé sur le côté. Myrtilles et amandes par-dessus.",
    kc: 470, pr: 36, gl: 50, li: 14,
    ing: [{n:"Fromage blanc 0%",base:200,u:"g"},{n:"Flocons d'avoine",base:50,u:"g"},{n:"Saumon fumé",base:60,u:"g"},{n:"Myrtilles surgelées",base:80,u:"g"},{n:"Amandes",base:15,u:"g"}],
    tips: ["Quelques gouttes de citron sur le saumon", "Variante avec saumon gravlax"],
    tags: ["saumon","bowl","oméga-3"],
  },
  {
    id: "fb_oeufs_jambon",
    name: "Oeufs & Jambon express",
    n: "Oeufs & Jambon express",
    emoji: "🍳",
    subtitle: "La version chaude",
    d: "Oeufs {2} brouillés, jambon blanc {80g}, fromage blanc 0% {150g}, flocons d'avoine {40g}",
    prep: "Oeufs brouillés 90 sec au micro-ondes. Fromage blanc + flocons en parallèle.",
    kc: 460, pr: 40, gl: 38, li: 18,
    ing: [{n:"Oeufs",base:2,u:""},{n:"Jambon blanc",base:80,u:"g"},{n:"Fromage blanc 0%",base:150,u:"g"},{n:"Flocons d'avoine",base:40,u:"g"}],
    tips: ["Micro-ondes 90 sec pour les oeufs = ultra rapide", "Ajouter ciboulette ou herbes"],
    tags: ["chaud","oeufs","jambon"],
  },
  {
    id: "fb_oeufs_saumon",
    name: "Oeufs & Saumon fumé",
    n: "Oeufs & Saumon fumé",
    emoji: "🥚",
    subtitle: "Protéines maximales",
    d: "Oeufs {2} brouillés, saumon fumé {60g}, fromage blanc 0% {150g}, flocons d'avoine {40g}, myrtilles {60g}",
    prep: "Oeufs brouillés avec ciboulette. Saumon fumé à côté. Fromage blanc + flocons + myrtilles.",
    kc: 480, pr: 42, gl: 40, li: 16,
    ing: [{n:"Oeufs",base:2,u:""},{n:"Saumon fumé",base:60,u:"g"},{n:"Fromage blanc 0%",base:150,u:"g"},{n:"Flocons d'avoine",base:40,u:"g"},{n:"Myrtilles surgelées",base:60,u:"g"}],
    tips: ["Version froide possible sans cuisson"],
    tags: ["oeufs","saumon","protéines"],
  },
  {
    id: "fb_bowl_complet",
    name: "Bowl Fromage blanc express",
    n: "Bowl Fromage blanc express",
    emoji: "🥣",
    subtitle: "Le plus rapide — 2 min",
    d: "Fromage blanc 0% {250g}, flocons d'avoine {60g}, myrtilles {100g}, noix {20g}",
    prep: "Tout dans un bol dans l'ordre. 2 minutes chrono.",
    kc: 430, pr: 30, gl: 56, li: 12,
    ing: [{n:"Fromage blanc 0%",base:250,u:"g"},{n:"Flocons d'avoine",base:60,u:"g"},{n:"Myrtilles surgelées",base:100,u:"g"},{n:"Noix",base:20,u:"g"}],
    tips: ["Le plus rapide", "Ajouter la whey directement dans le bowl"],
    tags: ["bowl","rapide","sans cuisson"],
  },
];

// Pick pondéré : les recettes likées ont 3× plus de chances d'être choisies
const pick = (arr, excl=[], liked=[]) => {
  const pool = arr.filter(r => !excl.includes(r.id));
  if (!pool.length) return arr[0];
  // Construire un tableau pondéré
  const weighted = [];
  pool.forEach(r => {
    const w = liked.includes(r.id) ? 3 : 1;
    for (let i=0; i<w; i++) weighted.push(r);
  });
  return weighted[Math.floor(Math.random() * weighted.length)];
};
const totalFactor = (convList, coeffs) => convList.reduce((s,id) => s+(coeffs[id]||0), 0);

const getPool = (k, dayType, ctx, fixedBreakfastId, forChange=false) => {
  if (ctx==="fun") return REC.fun[k] || (k==="b" ? REC.breakfast : k==="l" ? REC.lunch_train : REC.dinner_train);
  if (k==="b") {
    // Si on cherche à changer (🔄), on propose tous les petit-déj fixes
    if (forChange) return FIXED_BREAKFASTS;
    // Sinon on retourne le petit-déj fixe sélectionné
    const fixed = FIXED_BREAKFASTS.find(f => f.id === fixedBreakfastId);
    return fixed ? [fixed] : REC.breakfast;
  }
  if (k==="l") return dayType==="repos" ? REC.lunch_repos : REC.lunch_train;
  return dayType==="repos" ? REC.dinner_repos : REC.dinner_train;
};

const adaptDesc = (recipe, factor) => {
  if (!recipe) return "";
  const text = recipe.d || recipe.desc || "";
  return text.replace(/\{([^}]+)\}/g, (_, c) => {
    const m = c.match(/^([\d.]+)(.*)$/);
    if (m) { const n=parseFloat(m[1]),r=m[2],a=Number.isInteger(n)?Math.round(n*factor):(n*factor).toFixed(1); return `${a}${r}`; }
    return c;
  });
};

// ─── INITIAL STATE ────────────────────────────────────────────────────────────
const initState = () => ({
  phase: "wizard", // wizard | app
  wizStep: 1,
  // Profile
  poids: 85, taille: 182,
  prots: ["Poulet","Saumon","Thon","Boeuf","Porc","Oeufs","Crevettes"],
  excl: ["Fruits de mer","Abats","Tofu","Aubergines"],
  style: ["Simple & rapide","Cuisine française","Batch cooking"],
  convDefs: DEFAULT_CONVS.map(c=>({...c})),
  selectedConvs: ["moi"],
  coeffs: { moi:1.00, femme:0.85, gaston:0.45, marius:0.70, jules:0.90 },
  // App state
  dayType: "training",
  mult: 1.0,
  today: { b:{recipe:null,convives:["moi"],ctx:"home"}, l:{recipe:null,convives:["moi"],ctx:"home"}, d:{recipe:null,convives:["moi"],ctx:"home"} },
  week: {}, // key: "dayIdx-slotKey" => { recipe, convives, ctx, permanent? }
  permanentMode: false, // si true, les repas ajoutés sont marqués permanents
  liked: [],
  disliked: [],
  fixedBreakfastId: "fb_tartines_jambon_favori", // petit-déj fixe sélectionné
  bMult: 1.0, // multiplicateur spécifique au petit-déjeuner
  activeTab: "week",
  modalKey: null,
  feat: {},
});

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
const STORAGE_KEY = "nc_v1";

// Sauvegarde tout l'état en une seule clé
async function saveAll(state) {
  const data = {
    phase: "app",
    poids: state.poids, taille: state.taille,
    prots: state.prots, excl: state.excl, style: state.style,
    convDefs: state.convDefs, selectedConvs: state.selectedConvs, coeffs: state.coeffs,
    dayType: state.dayType, mult: state.mult, bMult: state.bMult,
    fixedBreakfastId: state.fixedBreakfastId,
    liked: state.liked, disliked: state.disliked,
    week: state.week,
    ts: Date.now(),
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return "ok";
  } catch(e) {
    return "unavailable";
  }
}

async function loadAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { data: JSON.parse(raw), storageOk: true };
    return { data: null, storageOk: true };
  } catch(e) {
    return { data: null, storageOk: false };
  }
}

export default function NutriCoach() {
  const [S, setS] = useState(initState);
  const [ready, setReady] = useState(false);
  const [storageOk, setStorageOk] = useState(null); // null=inconnu, true=ok, false=ko
  const [saveStatus, setSaveStatus] = useState("idle");

  const save = useCallback(async (state) => {
    setSaveStatus("saving");
    const result = await saveAll(state);
    setSaveStatus(result === "ok" ? "saved" : result === "error" ? "error" : "unavailable");
    if (result === "ok") setTimeout(() => setSaveStatus("idle"), 2000);
  }, []);

  const upd = fn => setS(s => {
    const ns = {
      ...s,
      liked: [...(s.liked||[])],
      disliked: [...(s.disliked||[])],
      selectedConvs: [...(s.selectedConvs||[])],
      prots: [...(s.prots||[])],
      excl: [...(s.excl||[])],
      style: [...(s.style||[])],
      convDefs: (s.convDefs||[]).map(c=>({...c})),
      coeffs: {...(s.coeffs||{})},
      bMult: s.bMult ?? 1.0,
      week: {...(s.week||{})},
      today: {
        b: {...(s.today?.b||{})},
        l: {...(s.today?.l||{})},
        d: {...(s.today?.d||{})},
      },
    };
    fn(ns);
    setTimeout(() => save(ns), 0);
    return ns;
  });

  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = css;
    document.head.appendChild(el);
    return () => document.head.removeChild(el);
  }, []);

  useEffect(() => {
    loadAll().then(({ data, storageOk }) => {
      setStorageOk(storageOk);
      if (data) {
        setS(s => {
          const ns = { ...s, ...data, phase: "app" };
          const fixed = FIXED_BREAKFASTS.find(f=>f.id===ns.fixedBreakfastId)||FIXED_BREAKFASTS[0];
          if (!ns.week[`${TODAY_IDX}-b`]) ns.week[`${TODAY_IDX}-b`] = { recipe:fixed, ctx:"home", convives:[...(ns.selectedConvs||["moi"])] };
          const todayB = ns.week[`${TODAY_IDX}-b`];
          if (todayB) ns.today.b = {...ns.today.b, recipe:todayB.recipe, convives:todayB.convives};
          if (!ns.today.l?.recipe) ns.today.l = {...ns.today.l, recipe:pick(getPool("l",ns.dayType,"home",ns.fixedBreakfastId), ns.disliked||[], ns.liked||[])};
          if (!ns.today.d?.recipe) ns.today.d = {...ns.today.d, recipe:pick(getPool("d",ns.dayType,"home",ns.fixedBreakfastId), ns.disliked||[], ns.liked||[])};
          return ns;
        });
      }
      setReady(true);
    });
  }, []);

  if (!ready) return (
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"var(--bg)",gap:12,padding:24}}>
      <div style={{fontFamily:"Syne,sans-serif",color:"var(--ac)",fontSize:18,fontWeight:800,letterSpacing:3}}>NUTRICOACH</div>
      <div style={{fontSize:12,color:"var(--tm)"}}>Chargement de ton planning...</div>
    </div>
  );

  if (S.phase === "wizard") return <Wizard S={S} upd={upd} save={save} />;
  return <App S={S} upd={upd} saveStatus={saveStatus} storageOk={storageOk} />;
}

// ─── WIZARD ───────────────────────────────────────────────────────────────────
function Wizard({ S, upd, save }) {
  const next = () => upd(s => { s.wizStep = Math.min(s.wizStep+1, 4); });
  const prev = () => upd(s => { s.wizStep = Math.max(s.wizStep-1, 1); });
  const finish = () => {
    upd(s => {
      s.phase = "app";
      ["b","l","d"].forEach(k => {
        s.today[k].recipe = pick(getPool(k, s.dayType, "home", s.fixedBreakfastId), s.disliked||[], s.liked||[]);
        s.today[k].convives = [...s.selectedConvs];
      });
    });
  };

  const bar = (n) => (
    <div style={{display:"flex",gap:4,marginBottom:22}}>
      {[1,2,3,4].map(i=>(
        <div key={i} style={{flex:1,height:3,borderRadius:2,background:i<=n?"var(--ac)":"var(--s4)",transition:"background .3s"}}/>
      ))}
    </div>
  );

  const S1 = (
    <div>
      <div className="syne" style={{fontSize:20,fontWeight:700,marginBottom:6}}>Bienvenue Olivier 👋</div>
      <div style={{color:"var(--tm)",fontSize:13,marginBottom:18}}>Profil pré-chargé. Modifie ce qui ne correspond pas.</div>
      {[
        { key:"physique", icon:"📊", title:"Profil physique", view:`${S.poids} kg · ${S.taille}cm · objectif graisse viscérale abdominale`, edit:<PhysiqueEdit S={S} upd={upd}/> },
        { key:"prots",    icon:"✅", title:"Protéines aimées", view:S.prots.join(" · "), edit:<ChipsEdit field="prots" options={["Poulet","Saumon","Thon","Boeuf","Porc","Oeufs","Crevettes","Dinde","Cabillaud"]} S={S} upd={upd}/> },
        { key:"excl",     icon:"❌", title:"Exclusions", view:S.excl.join(" · ")||"Aucune", edit:<ChipsEdit field="excl" options={["Fruits de mer","Abats","Tofu","Aubergines","Gluten","Lactose","Porc","Noix"]} S={S} upd={upd}/> },
        { key:"style",    icon:"🍳", title:"Style culinaire", view:S.style.join(" · ")||"Aucun", edit:<ChipsEdit field="style" options={["Simple & rapide","Cuisine française","Batch cooking","Méditerranéen","Asiatique","Épicé"]} S={S} upd={upd}/> },
      ].map(b=><WizBlock key={b.key} {...b}/>)}
      <div style={{display:"flex",justifyContent:"flex-end",marginTop:16}}>
        <Btn onClick={next}>Suivant →</Btn>
      </div>
    </div>
  );

  const S2 = (
    <div>
      <div className="syne" style={{fontSize:20,fontWeight:700,marginBottom:6}}>Convives de référence</div>
      <div style={{color:"var(--tm)",fontSize:13,marginBottom:16}}>Qui peut manger avec toi ? Tu choisiras par repas.</div>
      {S.convDefs.map(c => (
        <ConvCard key={c.id} c={c} selected={S.selectedConvs.includes(c.id)}
          onToggle={() => upd(s => {
            const i=s.selectedConvs.indexOf(c.id);
            if (c.fixed) return;
            if (i>-1) s.selectedConvs.splice(i,1); else s.selectedConvs.push(c.id);
          })}
          onDelete={() => upd(s => { s.convDefs=s.convDefs.filter(x=>x.id!==c.id); const i=s.selectedConvs.indexOf(c.id); if(i>-1)s.selectedConvs.splice(i,1); })}
        />
      ))}
      <AddConvForm upd={upd}/>
      <div style={{display:"flex",justifyContent:"space-between",marginTop:16}}>
        <BtnGhost onClick={prev}>← Retour</BtnGhost>
        <Btn onClick={next}>Suivant →</Btn>
      </div>
    </div>
  );

  const S3 = (
    <div>
      <div className="syne" style={{fontSize:20,fontWeight:700,marginBottom:6}}>Tes cibles macro 🎯</div>
      <div style={{color:"var(--tm)",fontSize:13,marginBottom:16}}>Calculées sur ton profil et ta charge sportive.</div>
      <div style={{background:"var(--s2)",borderRadius:"var(--r)",padding:16,marginBottom:12}}>
        {[
          ["🏃 Entraînement","2 500 kcal · P 170g · G 280g · L 75g"],
          ["😴 Repos","2 000 kcal · P 160g · G 180g · L 70g"],
          ["🏔️ Sortie longue","2 700 kcal · P 175g · G 320g · L 75g"],
          ["💊 Compléments","Whey · Collagène · Oméga-3 · D3+K2 · Glycine · Magnésium — non comptés"],
        ].map(([l,v])=>(
          <div key={l} style={{fontSize:13,color:"var(--tm)",marginBottom:5}}>
            <strong style={{color:"var(--t)"}}>{l} :</strong> {v}
          </div>
        ))}
      </div>
      <div style={{background:"var(--s2)",borderRadius:"var(--r)",padding:16}}>
        <div style={{fontSize:13,color:"var(--tm)",marginBottom:5}}><strong style={{color:"var(--t)"}}>🌙 Règle soir :</strong> zéro pain · zéro fromage · dîner avant 20h30</div>
      </div>
      <div style={{display:"flex",justifyContent:"space-between",marginTop:16}}>
        <BtnGhost onClick={prev}>← Retour</BtnGhost>
        <Btn onClick={next}>Suivant →</Btn>
      </div>
    </div>
  );

  const S4 = (
    <div>
      <div className="syne" style={{fontSize:20,fontWeight:700,marginBottom:6}}>C'est parti ! 🚀</div>
      <div style={{color:"var(--tm)",fontSize:13,marginBottom:16}}>Tout est configuré. Commence par planifier ta semaine.</div>
      <div style={{background:"var(--s2)",borderRadius:"var(--r)",padding:16,marginBottom:12}}>
        <div style={{fontSize:13,color:"var(--tm)"}}>
          <p style={{marginBottom:6}}><strong style={{color:"var(--t)"}}>Protéines :</strong> {S.prots.join(" · ")}</p>
          <p style={{marginBottom:6}}><strong style={{color:"var(--t)"}}>Exclusions :</strong> {S.excl.join(" · ")||"Aucune"}</p>
          <p><strong style={{color:"var(--t)"}}>Convives :</strong> {S.selectedConvs.map(id=>S.convDefs.find(c=>c.id===id)?.name||id).join(" · ")}</p>
        </div>
      </div>
      <div style={{display:"flex",justifyContent:"space-between",marginTop:16}}>
        <BtnGhost onClick={prev}>← Retour</BtnGhost>
        <Btn onClick={finish}>Lancer NutriCoach →</Btn>
      </div>
    </div>
  );

  const steps = [null, S1, S2, S3, S4];

  return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:16,background:"var(--bg)"}}>
      <div style={{background:"var(--s1)",border:"1px solid var(--s4)",borderRadius:16,maxWidth:540,width:"100%",padding:32}}>
        <div className="syne" style={{fontSize:11,fontWeight:800,letterSpacing:4,textTransform:"uppercase",color:"var(--ac)",marginBottom:22}}>NutriCoach</div>
        {bar(S.wizStep)}
        {steps[S.wizStep]}
      </div>
    </div>
  );
}

function WizBlock({ icon, title, view, edit }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{background:"var(--s2)",borderRadius:"var(--r)",padding:14,marginBottom:10}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
        <span className="syne" style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:1,color:"var(--tm)"}}>{icon} {title}</span>
        <button onClick={()=>setOpen(!open)} style={{background:"transparent",border:"1px solid var(--s4)",color:"var(--tm)",padding:"3px 9px",borderRadius:6,fontSize:11,transition:"all .2s"}}>
          {open ? "✓ OK" : "✏️ Modifier"}
        </button>
      </div>
      {open ? edit : <div style={{fontSize:12,color:"var(--tm)"}}>{view}</div>}
    </div>
  );
}

function PhysiqueEdit({ S, upd }) {
  return (
    <div style={{display:"flex",gap:10,flexWrap:"wrap",marginTop:8}}>
      <div><label style={{fontSize:11,color:"var(--tm)",display:"block",marginBottom:3}}>Poids (kg)</label>
        <input type="number" defaultValue={S.poids} onChange={e=>upd(s=>{s.poids=+e.target.value})} style={{width:70,...inputSty}}/></div>
      <div><label style={{fontSize:11,color:"var(--tm)",display:"block",marginBottom:3}}>Taille (cm)</label>
        <input type="number" defaultValue={S.taille} onChange={e=>upd(s=>{s.taille=+e.target.value})} style={{width:70,...inputSty}}/></div>
    </div>
  );
}

function ChipsEdit({ field, options, S, upd }) {
  return (
    <div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:8}}>
      {options.map(v=>{
        const on=S[field].includes(v);
        return <button key={v} onClick={()=>upd(s=>{const i=s[field].indexOf(v);if(i>-1)s[field].splice(i,1);else s[field].push(v);})}
          style={{padding:"5px 12px",borderRadius:100,border:`1px solid ${on?"var(--ac)":"var(--s4)"}`,background:on?"var(--ac)":"transparent",color:on?"#000":"var(--tm)",fontSize:12,cursor:"pointer",transition:"all .2s"}}>
          {v}
        </button>;
      })}
    </div>
  );
}

function ConvCard({ c, selected, onToggle, onDelete }) {
  return (
    <div style={{display:"flex",alignItems:"center",gap:10,background:selected?"var(--acb)":"var(--s2)",border:`1px solid ${selected?"var(--ac)":"var(--s4)"}`,borderRadius:"var(--rs)",padding:"9px 12px",marginBottom:7,transition:"all .2s"}}>
      <span style={{fontSize:22}}>{c.emoji}</span>
      <div style={{flex:1}}>
        <div style={{fontSize:14,fontWeight:600}}>{c.name}</div>
        <div style={{fontSize:11,color:"var(--tm)"}}>Coeff. <strong style={{color:"var(--ac)"}}>{c.coeff.toFixed(2)}</strong> × ma portion{c.fixed&&" · toujours présent"}</div>
      </div>
      <button onClick={onToggle} style={{padding:"5px 11px",borderRadius:6,border:`1px solid ${selected?"var(--ac)":"var(--s4)"}`,background:selected?"var(--ac)":"transparent",color:selected?"#000":"var(--tm)",fontSize:12,cursor:"pointer",transition:"all .2s"}}>
        {selected ? "✓ Inclus" : "+ Inclure"}
      </button>
      {!c.fixed && <button onClick={onDelete} style={{background:"transparent",border:"none",color:"var(--td)",fontSize:14,cursor:"pointer",padding:4}}>✕</button>}
    </div>
  );
}

function AddConvForm({ upd }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(""); const [coeff, setCoeff] = useState(0.85); const [emoji, setEmoji] = useState("👩");
  const add = () => {
    if (!name.trim()) return;
    const id = "g_" + Date.now();
    upd(s => { s.convDefs.push({id,name:name.trim(),emoji,coeff:parseFloat(coeff),fixed:false}); s.selectedConvs.push(id); s.coeffs[id]=parseFloat(coeff); });
    setName(""); setOpen(false);
  };
  return (
    <div style={{marginBottom:10}}>
      <button onClick={()=>setOpen(!open)} style={{width:"100%",padding:"8px",background:"transparent",border:"1px solid var(--s4)",color:"var(--tm)",borderRadius:"var(--rs)",fontSize:13,cursor:"pointer"}}>
        {open ? "✕ Fermer" : "+ Ajouter un convive"}
      </button>
      {open && (
        <div style={{background:"var(--s3)",borderRadius:"var(--rs)",padding:12,marginTop:8}}>
          <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:8}}>
            <div><label style={{fontSize:11,color:"var(--tm)",display:"block",marginBottom:3}}>Prénom</label>
              <input value={name} onChange={e=>setName(e.target.value)} placeholder="Ex: Sophie" style={{...inputSty,width:120}}/></div>
            <div><label style={{fontSize:11,color:"var(--tm)",display:"block",marginBottom:3}}>Emoji</label>
              <select value={emoji} onChange={e=>setEmoji(e.target.value)} style={{...inputSty,fontSize:16}}>
                {["👩","👨","👧","👦","👶","🧒","🧑","👴","👵"].map(e=><option key={e}>{e}</option>)}
              </select></div>
            <div><label style={{fontSize:11,color:"var(--tm)",display:"block",marginBottom:3}}>Coefficient</label>
              <select value={coeff} onChange={e=>setCoeff(e.target.value)} style={inputSty}>
                {[["0.35","Enfant <3a"],["0.45","Enfant ~5a"],["0.60","Enfant ~8a"],["0.70","Enfant ~10a"],["0.80","Ado 12-13a"],["0.90","Ado 14-16a"],["0.85","Femme adulte"],["1.00","Homme adulte"],["1.10","Sportif"]].map(([v,l])=><option key={v} value={v}>{l} (×{v})</option>)}
              </select></div>
          </div>
          <Btn onClick={add}>✓ Ajouter</Btn>
        </div>
      )}
    </div>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────
const TABS = [
  { id:"week",    icon:"📅", label:"Semaine" },
  { id:"today",   icon:"☀️", label:"Aujourd'hui" },
  { id:"courses", icon:"🛒", label:"Courses" },
  { id:"batch",   icon:"🍱", label:"Batch" },
  { id:"library", icon:"❤️", label:"Librairie" },
  { id:"frigo",   icon:"🧊", label:"Mon frigo" },
  { id:"fete",    icon:"🥂", label:"Fête" },
  { id:"self",    icon:"🏢", label:"Self" },
  { id:"resto",   icon:"🍽️", label:"Resto" },
  { id:"profil",  icon:"⚙️",  label:"Profil" },
];

function App({ S, upd, saveStatus, storageOk }) {
  const [recipeModal, setRecipeModal] = useState(null); // { recipe, convives }
  const m = MACROS[S.dayType];
  const myMacros = (slot, slotKey) => {
    const r=slot.recipe; if(!r) return {kc:0,pr:0,gl:0,li:0};
    const mu=(S.mult||1) * (slotKey==="b" ? (S.bMult??1.0) : 1);
    return {kc:Math.round(r.kc*mu),pr:Math.round(r.pr*mu),gl:Math.round(r.gl*mu),li:Math.round(r.li*mu)};
  };
  const totals = () => {
    let t={kc:0,pr:0,gl:0,li:0};
    ["b","l","d"].forEach(k=>{const mx=myMacros(S.today[k],k);t.kc+=mx.kc;t.pr+=mx.pr;t.gl+=mx.gl;t.li+=mx.li;});
    return t;
  };
  const t = totals();

  return (
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",background:"var(--bg)"}}>
      {/* HEADER */}
      <div style={{background:"var(--s1)",borderBottom:"1px solid var(--s4)",padding:"0 16px",display:"flex",alignItems:"center",gap:12,height:52,position:"sticky",top:0,zIndex:50}}>
        <div className="syne" style={{fontSize:13,fontWeight:800,letterSpacing:2,textTransform:"uppercase",color:"var(--ac)",whiteSpace:"nowrap"}}>
          NutriCoach
          {saveStatus==="saving" && <span style={{fontSize:9,color:"var(--tm)",marginLeft:6,fontFamily:"DM Sans",fontWeight:400,letterSpacing:0}}>💾</span>}
          {saveStatus==="saved"  && <span style={{fontSize:9,color:"var(--ac)",marginLeft:6,fontFamily:"DM Sans",fontWeight:400,letterSpacing:0}}>✓ sauvegardé</span>}
          {saveStatus==="error"  && <span style={{fontSize:9,color:"var(--re)",marginLeft:6,fontFamily:"DM Sans",fontWeight:400,letterSpacing:0}}>!</span>}
        </div>
        <div style={{display:"flex",gap:4}}>
          {Object.entries(MACROS).map(([k,v])=>(
            <button key={k} onClick={()=>upd(s=>{s.dayType=k;})}
              style={{padding:"4px 10px",borderRadius:100,border:`1px solid ${S.dayType===k?"var(--ac)":"var(--s4)"}`,background:S.dayType===k?"var(--ac)":"transparent",color:S.dayType===k?"#000":"var(--tm)",fontSize:11,cursor:"pointer",whiteSpace:"nowrap",transition:"all .2s"}}>
              {k==="repos"?"😴 Repos":k==="training"?"🏃 Entraîn.":"🏔️ Long"}
            </button>
          ))}
        </div>
        <div style={{display:"flex",gap:4,marginLeft:"auto"}}>
          {[["kc",t.kc,"kcal","var(--ac)"],["pr",t.pr+"g","prot","var(--bl)"],["gl",t.gl+"g","gluc","var(--or)"],["li",t.li+"g","lip","var(--re)"]].map(([id,val,lbl,col])=>(
            <div key={id} style={{display:"flex",flexDirection:"column",alignItems:"center",background:"var(--s2)",border:"1px solid var(--s4)",borderRadius:8,padding:"2px 8px",minWidth:48}}>
              <span style={{fontWeight:700,fontSize:12,color:col}}>{val}</span>
              <span style={{fontSize:9,color:"var(--tm)",textTransform:"uppercase",letterSpacing:1}}>{lbl}</span>
            </div>
          ))}
        </div>
      </div>

      {/* TABS */}
      <div style={{display:"flex",background:"var(--s1)",borderBottom:"1px solid var(--s4)",overflowX:"auto",padding:"0 16px"}}>
        {TABS.map(tab=>(
          <button key={tab.id} onClick={()=>upd(s=>{s.activeTab=tab.id;})}
            style={{padding:"10px 12px",background:"transparent",border:"none",borderBottom:`2px solid ${S.activeTab===tab.id?"var(--ac)":"transparent"}`,color:S.activeTab===tab.id?"var(--ac)":"var(--tm)",fontSize:12,cursor:"pointer",whiteSpace:"nowrap",fontWeight:500,transition:"all .2s"}}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* MAIN */}
      <div style={{flex:1,padding:16,maxWidth:1100,margin:"0 auto",width:"100%"}}>
        {S.activeTab==="week"    && <WeekTab    S={S} upd={upd} onOpenRecipe={setRecipeModal}/>}
        {S.activeTab==="today"   && <TodayTab   S={S} upd={upd} myMacros={myMacros} m={m} onOpenRecipe={setRecipeModal}/>}
        {S.activeTab==="courses" && <CoursesTab S={S}/>}
        {S.activeTab==="batch"   && <BatchTab/>}
        {S.activeTab==="library" && <LibraryTab  S={S} upd={upd}/>}
        {S.activeTab==="frigo"   && <FrigoTab    S={S} upd={upd}/>}
        {S.activeTab==="fete"    && <FeteTab/>}
        {S.activeTab==="self"    && <SelfTab    S={S}/>}
        {S.activeTab==="resto"   && <RestoTab   S={S}/>}
        {S.activeTab==="profil"  && <ProfilTab  S={S} upd={upd} storageOk={storageOk}/>}
      </div>

      {/* MODAL CONVIVES */}
      {S.modalKey && <ConvModal S={S} upd={upd}/>}

      {/* MODAL FICHE RECETTE */}
      {recipeModal && (
        <RecipeModal
          recipe={recipeModal.recipe}
          convives={recipeModal.convives||["moi"]}
          coeffs={S.coeffs}
          mult={S.mult}
          isLiked={(S.liked||[]).includes(recipeModal.recipe?.id)}
          onClose={()=>setRecipeModal(null)}
          onLike={()=>upd(s=>{
            const id=recipeModal.recipe?.id; if(!id) return;
            if(!s.liked.includes(id)) s.liked.push(id);
            const j=s.disliked.indexOf(id); if(j>-1) s.disliked.splice(j,1);
          })}
          onDislike={()=>{
            upd(s=>{
              const id=recipeModal.recipe?.id; if(!id) return;
              if(!s.disliked.includes(id)) s.disliked.push(id);
              const j=s.liked.indexOf(id); if(j>-1) s.liked.splice(j,1);
            });
            setRecipeModal(null);
          }}
        />
      )}
    </div>
  );
}

// ─── WEEK TAB ─────────────────────────────────────────────────────────────────
function WeekTab({ S, upd, onOpenRecipe }) {
  const [addMenuKey, setAddMenuKey] = useState(null);
  const [saveMsg, setSaveMsg] = useState(null);
  const [importing, setImporting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  const clearWeek = () => {
    const permanentSlots = Object.entries(S.week)
      .filter(([,slot]) => slot?.permanent)
      .reduce((acc,[k,v]) => ({...acc,[k]:v}), {});
    const count = Object.keys(S.week).length - Object.keys(permanentSlots).length;
    if (count === 0) { setSaveMsg("Aucun repas ponctuel à supprimer."); setTimeout(()=>setSaveMsg(null),2500); return; }
    if (!confirm(`Vider ${count} repas non-permanents ? Les repas 📌 permanents sont conservés.`)) return;
    upd(s => { s.week = permanentSlots; });
    setSaveMsg(`✓ ${count} repas supprimés. Les repas permanents sont conservés.`);
    setTimeout(()=>setSaveMsg(null), 3000);
  };

  const assign = (key, k, ctx) => {
    const pool = getPool(k, S.dayType, ctx, S.fixedBreakfastId);
    const recipe = (ctx==="resto"||ctx==="self") ? null : pick(pool, S.disliked||[], S.liked||[]);
    upd(s => { s.week[key] = { recipe, ctx, convives:[...s.selectedConvs], permanent: s.permanentMode }; });
    setAddMenuKey(null);
  };

  const remove = (key) => upd(s => { delete s.week[key]; });
  const change = (key, k) => {
    upd(s => {
      const slot = s.week[key]; if(!slot) return;
      const pool = getPool(k, s.dayType, slot.ctx||"home", s.fixedBreakfastId, k==="b");
      const excl = [...(s.disliked||[]), ...(slot.recipe?.id ? [slot.recipe.id] : [])];
      const next = pick(pool, excl, s.liked||[]);
      if (next) s.week[key] = {...slot, recipe:next};
    });
  };
  const cycleCtx = (key, k) => {
    const slot = S.week[key]; if(!slot) return;
    const order=["home","self","resto","fun"]; const next=order[(order.indexOf(slot.ctx||"home")+1)%order.length];
    const recipe = (next==="resto"||next==="self") ? null : pick(getPool(k, S.dayType, next, S.fixedBreakfastId), S.disliked||[], S.liked||[]);
    upd(s => { s.week[key]={...slot,ctx:next,recipe}; });
  };

  const [showSavePanel, setShowSavePanel] = useState(false);
  // ── Export image du planning ──
  const exportImage = async () => {
    setSaveMsg("📸 Génération de l'image...");
    setPreviewUrl(null);
    // Injecter le petit-déj fixe uniquement pour les jours qui ont d'autres repas planifiés
    const weekWithBreakfast = {...(S.week||{})};
    const fixedB = FIXED_BREAKFASTS.find(f=>f.id===S.fixedBreakfastId)||FIXED_BREAKFASTS[0];
    DAYS.forEach((_,di) => {
      const bKey = `${di}-b`;
      const hasOtherMeals = S.week[`${di}-l`] || S.week[`${di}-d`];
      if (!weekWithBreakfast[bKey] && hasOtherMeals) {
        weekWithBreakfast[bKey] = { recipe:fixedB, ctx:"home", convives:[...(S.selectedConvs||["moi"])] };
      }
    });
    try {
      // Construire un canvas HTML du planning
      const canvas = document.createElement("canvas");
      const cols = 8; const rows = 4; // header + 3 slots
      const cw = 140; const ch = 90; const pad = 6;
      canvas.width  = cols * (cw + pad) + pad;
      canvas.height = rows * (ch + pad) + pad + 50; // 50 pour le titre
      const ctx = canvas.getContext("2d");

      // Fond
      ctx.fillStyle = "#0f0f0f";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Titre
      ctx.fillStyle = "#c8f055";
      ctx.font = "bold 16px sans-serif";
      ctx.fillText("NutriCoach — Planning semaine", pad, 30);
      ctx.fillStyle = "#888";
      ctx.font = "12px sans-serif";
      ctx.fillText(new Date().toLocaleDateString("fr-FR", {weekday:"long",day:"numeric",month:"long"}), pad, 46);

      const offsetY = 50;

      // En-têtes jours
      const dayHeaders = ["", ...DAYS];
      dayHeaders.forEach((d, i) => {
        const x = pad + i * (cw + pad);
        ctx.fillStyle = i === TODAY_IDX + 1 ? "#c8f055" : "#555";
        ctx.fillRect(x, offsetY + pad, cw, 30);
        ctx.fillStyle = i === TODAY_IDX + 1 ? "#000" : "#aaa";
        ctx.font = "bold 11px sans-serif";
        ctx.fillText(d, x + 8, offsetY + pad + 20);
      });

      // Cellules repas
      SLOTS.forEach(({k, icon, label}, ri) => {
        const y = offsetY + pad + 30 + pad + ri * (ch + pad);

        // Label slot
        ctx.fillStyle = "#2a2a2a";
        ctx.fillRect(pad, y, cw, ch);
        ctx.fillStyle = "#888";
        ctx.font = "11px sans-serif";
        ctx.fillText(icon + " " + label, pad + 6, y + 20);

        DAYS.forEach((_, di) => {
          const x = pad + (di + 1) * (cw + pad);
          const slot = weekWithBreakfast[`${di}-${k}`];
          const ctx2 = ctx;

          if (slot?.recipe) {
            ctx2.fillStyle = "#2a2a2a";
            ctx2.fillRect(x, y, cw, ch);
            ctx2.fillStyle = slot.ctx==="fun"?"#c8f055":slot.ctx==="resto"?"#ff9a3c":slot.ctx==="self"?"#5cb8ff":"#444";
            ctx2.fillRect(x, y, cw, 4);
            ctx2.fillStyle = "#f0ede8";
            ctx2.font = "bold 10px sans-serif";
            const words = (slot.recipe.n||slot.recipe.name||slot.recipe.name||"").split(" ");
            let line = ""; let lineY = y + 20;
            words.forEach(w => {
              const test = line + (line?" ":"") + w;
              if (ctx2.measureText(test).width > cw - 12) {
                ctx2.fillText(line, x + 6, lineY); line = w; lineY += 13;
              } else { line = test; }
            });
            if (line) ctx2.fillText(line, x + 6, lineY);
            ctx2.fillStyle = "#c8f055";
            ctx2.font = "10px sans-serif";
            ctx2.fillText((slot.recipe.kc||0) + " kcal", x + 6, y + ch - 22);
            const convs = slot.convives || ["moi"];
            const emojis = convs.map(id => S.convDefs.find(c=>c.id===id)?.emoji||"?").join(" ");
            ctx2.fillStyle = "#888";
            ctx2.font = "11px sans-serif";
            ctx2.fillText(emojis, x + 6, y + ch - 8);
          } else if (slot) {
            // Self, Resto ou Fun sans recette
            const ctxD = CONTEXTS[slot.ctx||"home"];
            ctx2.fillStyle = "#1e1e1e";
            ctx2.fillRect(x, y, cw, ch);
            ctx2.fillStyle = slot.ctx==="fun"?"#c8f055":slot.ctx==="resto"?"#ff9a3c":slot.ctx==="self"?"#5cb8ff":"#555";
            ctx2.fillRect(x, y, cw, 4);
            ctx2.fillStyle = "#666";
            ctx2.font = "11px sans-serif";
            ctx2.fillText(ctxD.icon + " " + ctxD.label, x + 6, y + 20);
            ctx2.fillStyle = "#444";
            ctx2.font = "italic 10px sans-serif";
            ctx2.fillText(slot.ctx==="resto"?"Menu sur place":slot.ctx==="self"?"Choix self":"—", x + 6, y + 36);
            const convs = slot.convives || ["moi"];
            const emojis = convs.map(id => S.convDefs.find(c=>c.id===id)?.emoji||"?").join(" ");
            ctx2.fillStyle = "#888";
            ctx2.font = "11px sans-serif";
            ctx2.fillText(emojis, x + 6, y + ch - 8);
          } else {
            ctx2.fillStyle = "#161616";
            ctx2.fillRect(x, y, cw, ch);
            ctx2.fillStyle = "#333";
            ctx2.font = "20px sans-serif";
            ctx2.fillText("+", x + cw/2 - 6, y + ch/2 + 6);
          }
        });
      });

      // Watermark
      ctx.fillStyle = "#333";
      ctx.font = "10px sans-serif";
      ctx.fillText("NutriCoach · généré le " + new Date().toLocaleDateString("fr-FR"), pad, canvas.height - 6);

      // Afficher inline (mobile-friendly)
      const dataUrl = canvas.toDataURL("image/png");
      setPreviewUrl(dataUrl);
      setSaveMsg(null);

    } catch(err) {
      setSaveMsg("❌ Erreur : " + String(err?.message||err));
      setTimeout(()=>setSaveMsg(null), 5000);
    }
  };

  const nMeals = Object.values(S.week).filter(s=>s?.recipe||s?.ctx==="self"||s?.ctx==="resto").length;

  return (
    <div onClick={()=>setAddMenuKey(null)}>
      <Card>
        {/* Header */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8,marginBottom:12}}>
          <div className="syne" style={{fontSize:15,fontWeight:700}}>
            Planning semaine
            <span style={{fontSize:10,padding:"3px 8px",borderRadius:100,background:"var(--acb)",color:"var(--ac)",fontFamily:"DM Sans",marginLeft:8}}>
              {nMeals} repas
            </span>
          </div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
            <Btn onClick={()=>upd(s=>{s.activeTab="courses"})}>🛒 Courses</Btn>
            <button onClick={exportImage}
              style={{padding:"7px 13px",background:"var(--s2)",color:"var(--t)",border:"1px solid var(--s4)",borderRadius:6,fontSize:12,cursor:"pointer"}}>
              📸 Image
            </button>
            <button onClick={clearWeek}
              style={{padding:"7px 13px",background:"transparent",border:"1px solid var(--re)",color:"var(--re)",borderRadius:6,fontSize:12,cursor:"pointer",fontWeight:600}}>
              🗑️ Vider la semaine
            </button>
          </div>
        </div>

        {/* Bandeau planning permanent */}
        <div style={{display:"flex",alignItems:"center",gap:10,padding:"8px 12px",background:"var(--s3)",borderRadius:"var(--rs)",marginBottom:12}}>
          <button onClick={()=>upd(s=>{s.permanentMode=!s.permanentMode;})}
            style={{padding:"5px 12px",borderRadius:100,border:`1px solid ${S.permanentMode?"var(--ac)":"var(--s4)"}`,background:S.permanentMode?"var(--ac)":"transparent",color:S.permanentMode?"#000":"var(--tm)",fontSize:12,cursor:"pointer",fontWeight:S.permanentMode?600:400,transition:"all .2s",whiteSpace:"nowrap"}}>
            📌 {S.permanentMode ? "Mode permanent actif" : "Activer le mode permanent"}
          </button>
          <span style={{fontSize:11,color:"var(--tm)",lineHeight:1.4}}>
            {S.permanentMode
              ? "Les repas ajoutés maintenant sont permanents — ils reviennent chaque semaine."
              : "Active ce mode pour fixer ta routine hebdomadaire."}
          </span>
        </div>

        {saveMsg && (
          <div style={{padding:"8px 12px",background:saveMsg.startsWith("❌")?"rgba(255,92,92,.1)":"var(--acb)",border:`1px solid ${saveMsg.startsWith("❌")?"var(--re)":"var(--ac)"}`,borderRadius:"var(--rs)",fontSize:12,color:saveMsg.startsWith("❌")?"var(--re)":"var(--ac)",marginBottom:12}}>
            {saveMsg}
          </div>
        )}

        {/* Modale plein écran image */}
        {previewUrl && (
          <div style={{position:"fixed",inset:0,zIndex:300,background:"rgba(0,0,0,.95)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"flex-start",padding:16,overflowY:"auto"}}>
            <div style={{width:"100%",maxWidth:600}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                <div style={{fontSize:14,fontWeight:700,color:"var(--ac)"}}>📸 Planning généré</div>
                <button onClick={()=>setPreviewUrl(null)} style={{background:"transparent",border:"1px solid var(--s4)",color:"var(--tm)",borderRadius:6,padding:"5px 12px",fontSize:12,cursor:"pointer"}}>✕ Fermer</button>
              </div>
              <div style={{fontSize:12,color:"var(--tm)",marginBottom:12,padding:"10px 12px",background:"var(--s2)",borderRadius:"var(--rs)",lineHeight:1.7}}>
                📱 <strong style={{color:"var(--t)"}}>iPhone :</strong> Appuie <strong style={{color:"var(--ac)"}}>longuement</strong> → "Enregistrer dans Photos"
              </div>
              <img src={previewUrl} alt="Planning NutriCoach"
                style={{width:"100%",height:"auto",borderRadius:"var(--rs)",display:"block",border:"2px solid var(--ac)"}}/>
              <div style={{fontSize:11,color:"var(--td)",textAlign:"center",marginTop:8}}>Appuie longuement pour enregistrer</div>
            </div>
          </div>
        )}

        <div style={{fontSize:12,color:"var(--tm)",marginBottom:12}}>Clique + pour ajouter · 👥 convives · 🔄 changer · icône pour cycler le contexte</div>
        <div style={{overflowX:"auto"}}>
          <div style={{display:"grid",gridTemplateColumns:"52px repeat(7,minmax(110px,1fr))",gap:2,minWidth:830}}>
            <div style={wghSty}/>
            {DAYS.map((d,i)=><div key={d} style={{...wghSty,color:i===TODAY_IDX?"var(--ac)":"var(--tm)"}}>{d}{i===TODAY_IDX?" ✦":""}</div>)}
            {SLOTS.map(({k,icon,label})=>[
              <div key={`lbl-${k}`} style={{...wghSty,fontSize:9}}>{icon}<br/>{label}</div>,
              ...DAYS.map((_,di)=>{
                const key=`${di}-${k}`;
                const slot=S.week[key];
                const ctx=slot?.ctx||"home";
                const ctxDef=CONTEXTS[ctx];
                const convs=slot?.convives||["moi"];
                const emojis=convs.map(id=>S.convDefs.find(c=>c.id===id)?.emoji||"?");
                const f=totalFactor(convs,S.coeffs);
                const isAM=addMenuKey===key;

                return (
                  <div key={key} onClick={e=>e.stopPropagation()}
                    style={{background:slot?"var(--s3)":"var(--s2)",borderRadius:"var(--rs)",padding:6,minHeight:90,border:`1px solid ${slot?"var(--s4)":"transparent"}`,position:"relative",transition:"all .2s"}}>
                    {slot ? (
                      <>
                        <div style={{fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:.5,color:ctxDef.color,marginBottom:2}}>
                          {slot.permanent && <span style={{color:"var(--ac)",marginRight:3}}>📌</span>}
                          {ctxDef.icon} {ctxDef.label}
                        </div>
                        {slot.recipe ? <>
                          <button onClick={()=>onOpenRecipe&&onOpenRecipe({recipe:slot.recipe,convives:convs})}
                            style={{width:"100%",textAlign:"left",background:"transparent",border:"none",cursor:"pointer",padding:0,marginBottom:2}}>
                            <div style={{fontSize:10,fontWeight:600,color:"var(--ac)",lineHeight:1.3,textDecoration:"underline",textDecorationColor:"rgba(200,240,85,.4)"}}>{slot.recipe.n||slot.recipe.name}</div>
                          </button>
                          <div style={{fontSize:9,color:"var(--ac)",marginBottom:3}}>{slot.recipe.kc} kcal</div>
                        </> : <div style={{fontSize:10,color:"var(--tm)",fontStyle:"italic",marginBottom:3}}>{ctx==="resto"?"Menu sur place":"Choix self"}</div>}
                        <div style={{display:"flex",flexWrap:"wrap",gap:2,marginBottom:3}}>
                          {emojis.map((e,i)=><span key={i} style={{fontSize:9,padding:"1px 4px",borderRadius:100,background:"var(--acb)",color:"var(--ac)"}}>{e}</span>)}
                        </div>
                        <div style={{fontSize:9,color:"var(--tm)",marginBottom:4}}>{f.toFixed(1)} portion(s)</div>
                        <div style={{display:"flex",gap:2,flexWrap:"wrap"}}>
                          <button onClick={()=>upd(s=>{s.week[key]={...s.week[key],permanent:!s.week[key].permanent};})} style={{...cellBtn,color:slot.permanent?"var(--ac)":"var(--td)"}} title={slot.permanent?"Retirer permanent":"Marquer permanent"}>📌</button>
                          <button onClick={()=>upd(s=>{s.modalKey=key;})} style={cellBtnAc}>👥</button>
                          <button onClick={()=>cycleCtx(key,k)} style={cellBtn} title="Changer contexte">{ctxDef.icon}</button>
                          {slot.recipe && <button onClick={()=>change(key,k)} style={cellBtn}>🔄</button>}
                          <button onClick={()=>remove(key)} style={{...cellBtn,color:"var(--re)"}}>✕</button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,opacity:.15,pointerEvents:"none"}}>+</div>
                        <button onClick={e=>{e.stopPropagation();setAddMenuKey(isAM?null:key);}}
                          style={{position:"absolute",inset:0,width:"100%",height:"100%",background:"transparent",border:"none",cursor:"pointer"}}/>
                        {isAM && (
                          <div style={{position:"absolute",top:0,left:0,right:0,background:"var(--s1)",border:"1px solid var(--ac)",borderRadius:"var(--rs)",padding:5,zIndex:10,display:"flex",flexDirection:"column",gap:3}}>
                            {Object.entries(CONTEXTS).map(([ck,cv])=>(
                              <button key={ck} onClick={()=>assign(key,k,ck)}
                                style={{padding:"5px 8px",borderRadius:5,border:"1px solid var(--s4)",background:"var(--s2)",color:cv.color,cursor:"pointer",fontSize:11,textAlign:"left"}}>
                                {cv.icon} {cv.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })
            ])}
          </div>
        </div>
      </Card>
    </div>
  );
}

// ─── CONVIVES MODAL ───────────────────────────────────────────────────────────
function ConvModal({ S, upd }) {
  const slot = S.week[S.modalKey];
  const [selected, setSelected] = useState(slot?.convives||["moi"]);
  const [addOpen, setAddOpen] = useState(false);
  const [newName, setNewName] = useState(""); const [newCoeff, setNewCoeff] = useState(0.85); const [newEmoji, setNewEmoji] = useState("👩");

  const parts = S.modalKey.split("-");
  const dayName = ["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi","Dimanche"][parseInt(parts[0])];
  const slotName = {b:"Petit-déjeuner",l:"Déjeuner",d:"Dîner"}[parts[1]];
  const f = totalFactor(selected, S.coeffs);

  const confirm = () => {
    upd(s => { if(s.week[s.modalKey]) s.week[s.modalKey].convives=[...selected]; s.modalKey=null; });
  };
  const addGuest = () => {
    if (!newName.trim()) return;
    const id="g_"+Date.now();
    upd(s=>{s.convDefs.push({id,name:newName.trim(),emoji:newEmoji,coeff:parseFloat(newCoeff),fixed:false});s.coeffs[id]=parseFloat(newCoeff);});
    setSelected(prev=>[...prev,id]);
    setNewName(""); setAddOpen(false);
  };

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.75)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div style={{background:"var(--s1)",border:"1px solid var(--s4)",borderRadius:16,padding:26,maxWidth:420,width:"100%"}}>
        <div className="syne" style={{fontSize:15,fontWeight:700,marginBottom:4}}>👥 {dayName} — {slotName}</div>
        {slot?.recipe && <div style={{fontSize:12,color:"var(--tm)",marginBottom:14}}>{slot.recipe.n||slot.recipe.name}</div>}
        <div style={{display:"flex",flexWrap:"wrap",gap:7,marginBottom:12}}>
          {S.convDefs.map(c=>{
            const on=selected.includes(c.id);
            return <button key={c.id} onClick={()=>{if(c.id==="moi")return;setSelected(p=>on?p.filter(x=>x!==c.id):[...p,c.id]);}}
              style={{padding:"6px 12px",borderRadius:100,border:`1px solid ${on?"var(--ac)":"var(--s4)"}`,background:on?"var(--acb)":"transparent",color:on?"var(--ac)":"var(--tm)",fontSize:12,cursor:"pointer",display:"inline-flex",alignItems:"center",gap:5}}>
              {c.emoji} {c.name} <span style={{fontSize:10,opacity:.7}}>×{c.coeff.toFixed(2)}</span>
            </button>;
          })}
        </div>
        <div style={{fontSize:12,color:"var(--tm)",marginBottom:12}}>
          Total : <strong style={{color:"var(--ac)"}}>{f.toFixed(2)} portion(s)</strong> · {selected.map(id=>S.convDefs.find(c=>c.id===id)?.name||id).join(" + ")}
        </div>
        <button onClick={()=>setAddOpen(!addOpen)} style={{width:"100%",padding:8,background:"transparent",border:"1px solid var(--s4)",color:"var(--tm)",borderRadius:"var(--rs)",fontSize:12,cursor:"pointer",marginBottom:8}}>
          {addOpen?"✕ Fermer":"+ Ajouter un convive ponctuel"}
        </button>
        {addOpen && (
          <div style={{background:"var(--s3)",borderRadius:"var(--rs)",padding:10,marginBottom:10}}>
            <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:8}}>
              <input value={newName} onChange={e=>setNewName(e.target.value)} placeholder="Prénom" style={{...inputSty,flex:1,minWidth:80}}/>
              <select value={newEmoji} onChange={e=>setNewEmoji(e.target.value)} style={{...inputSty,fontSize:16}}>
                {["👩","👨","👧","👦","👶","🧒","🧑","👴","👵"].map(e=><option key={e}>{e}</option>)}
              </select>
              <select value={newCoeff} onChange={e=>setNewCoeff(e.target.value)} style={inputSty}>
                {[["0.45","Enfant ~5a"],["0.70","Enfant ~10a"],["0.85","Femme adulte"],["1.00","Homme adulte"]].map(([v,l])=><option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <Btn onClick={addGuest}>✓ Ajouter</Btn>
          </div>
        )}
        <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
          <BtnGhost onClick={()=>upd(s=>{s.modalKey=null;})}>Annuler</BtnGhost>
          <Btn onClick={confirm}>Confirmer ✓</Btn>
        </div>
      </div>
    </div>
  );
}

// ─── BREAKFAST SELECTOR ───────────────────────────────────────────────────────
function BreakfastSelector({ S, upd, compact=false }) {
  const current = FIXED_BREAKFASTS.find(f => f.id === S.fixedBreakfastId) || FIXED_BREAKFASTS[0];
  const [open, setOpen] = useState(false);
  const bm = S.bMult ?? 1.0;

  // Macros ajustées avec bMult
  const adjKc  = Math.round(current.kc * bm);
  const adjPr  = Math.round(current.pr * bm);
  const adjGl  = Math.round(current.gl * bm);
  const adjLi  = Math.round(current.li * bm);

  const stepBMult = (delta) => upd(s => {
    s.bMult = Math.round(Math.max(0.5, Math.min(2.5, (s.bMult ?? 1.0) + delta)) * 10) / 10;
  });

  const MultControl = () => (
    <div style={{display:"flex",alignItems:"center",gap:8,marginTop:10,padding:"8px 12px",background:"var(--s3)",borderRadius:"var(--rs)"}}>
      <span style={{fontSize:12,color:"var(--tm)",flex:1}}>Taille de ma portion :</span>
      <button onClick={()=>stepBMult(-0.1)} style={{width:28,height:28,borderRadius:"50%",border:"1px solid var(--s4)",background:"var(--s2)",color:"var(--t)",fontSize:16,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>−</button>
      <span style={{fontSize:14,fontWeight:700,color:"var(--ac)",minWidth:36,textAlign:"center"}}>{bm.toFixed(1)}×</span>
      <button onClick={()=>stepBMult(0.1)} style={{width:28,height:28,borderRadius:"50%",border:"1px solid var(--s4)",background:"var(--s2)",color:"var(--t)",fontSize:16,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>+</button>
      <span style={{fontSize:11,color:"var(--tm)",marginLeft:4}}>{adjKc} kcal · P{adjPr}g</span>
    </div>
  );

  const select = (id) => {
    upd(s => {
      s.fixedBreakfastId = id;
      // Mettre à jour tous les petits-déj de la semaine
      Object.keys(s.week).forEach(key => {
        if (key.endsWith("-b") && s.week[key]?.ctx !== "fun") {
          const fixed = FIXED_BREAKFASTS.find(f => f.id === id);
          if (fixed) s.week[key] = { ...s.week[key], recipe: fixed };
        }
      });
      // Mettre à jour aujourd'hui
      const fixed = FIXED_BREAKFASTS.find(f => f.id === id);
      if (fixed) s.today.b = { ...s.today.b, recipe: fixed };
    });
    setOpen(false);
  };

  if (compact) return (
    <div style={{background:"var(--s2)",border:"1px solid var(--s4)",borderRadius:"var(--rs)",padding:10}}>
      <div style={{fontSize:10,textTransform:"uppercase",letterSpacing:1,color:"var(--tm)",fontFamily:"Syne,sans-serif",fontWeight:700,marginBottom:8}}>🌅 Mon petit-déjeuner fixe</div>
      <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:8}}>
        {FIXED_BREAKFASTS.map(f => (
          <button key={f.id} onClick={() => select(f.id)}
            style={{padding:"5px 11px",borderRadius:100,border:`1px solid ${S.fixedBreakfastId===f.id?"var(--ac)":"var(--s4)"}`,background:S.fixedBreakfastId===f.id?"var(--ac)":"transparent",color:S.fixedBreakfastId===f.id?"#000":"var(--tm)",fontSize:12,cursor:"pointer",transition:"all .2s",display:"inline-flex",alignItems:"center",gap:5}}>
            {f.emoji} {f.name}
          </button>
        ))}
      </div>
      <MultControl/>
    </div>
  );

  return (
    <div style={{background:"var(--s2)",border:`1px solid ${open?"var(--ac)":"var(--s4)"}`,borderRadius:"var(--r)",padding:16,marginBottom:13,transition:"border-color .2s"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:open?14:0}}>
        <div>
          <div style={{fontSize:10,textTransform:"uppercase",letterSpacing:1,color:"var(--tm)",fontFamily:"Syne,sans-serif",fontWeight:700,marginBottom:3}}>🌅 Petit-déjeuner fixe</div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:20}}>{current.emoji}</span>
            <div>
              <div style={{fontSize:14,fontWeight:600}}>{current.name}</div>
              <div style={{fontSize:11,color:"var(--tm)"}}>{current.subtitle} · {adjKc} kcal · P{adjPr}g</div>
            </div>
          </div>
        </div>
        <button onClick={()=>setOpen(!open)} style={{padding:"6px 12px",background:open?"var(--ac)":"transparent",color:open?"#000":"var(--tm)",border:`1px solid ${open?"var(--ac)":"var(--s4)"}`,borderRadius:6,fontSize:12,cursor:"pointer",transition:"all .2s",whiteSpace:"nowrap"}}>
          {open ? "✓ Fermer" : "Changer →"}
        </button>
      </div>
      <MultControl/>

      {open && (
        <div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:10,marginTop:4}}>
            {FIXED_BREAKFASTS.map(f => (
              <button key={f.id} onClick={() => select(f.id)}
                style={{padding:14,borderRadius:"var(--rs)",border:`2px solid ${S.fixedBreakfastId===f.id?"var(--ac)":"var(--s4)"}`,background:S.fixedBreakfastId===f.id?"rgba(200,240,85,.08)":"var(--s3)",cursor:"pointer",textAlign:"left",transition:"all .2s"}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                  <span style={{fontSize:22}}>{f.emoji}</span>
                  <div>
                    <div style={{fontSize:13,fontWeight:600,color:"var(--t)"}}>{f.name}</div>
                    <div style={{fontSize:11,color:"var(--tm)"}}>{f.subtitle}</div>
                  </div>
                  {S.fixedBreakfastId===f.id && <span style={{marginLeft:"auto",fontSize:16,color:"var(--ac)"}}>✓</span>}
                </div>
                <div style={{fontSize:11,color:"var(--tm)",marginBottom:6,lineHeight:1.5}}>{(f.d||f.desc||"").replace(/\{([^}]+)\}/g,"$1")}</div>
                <div style={{fontSize:11,color:"var(--or)",marginBottom:6,fontStyle:"italic"}}>📋 {f.prep}</div>
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                  <span style={{fontSize:10,padding:"2px 7px",borderRadius:100,background:"var(--acb)",color:"var(--ac)",fontWeight:600}}>{f.kc} kcal</span>
                  <span style={{fontSize:10,padding:"2px 7px",borderRadius:100,background:"rgba(92,184,255,.12)",color:"var(--bl)",fontWeight:600}}>P {f.pr}g</span>
                  <span style={{fontSize:10,padding:"2px 7px",borderRadius:100,background:"rgba(255,154,60,.12)",color:"var(--or)",fontWeight:600}}>G {f.gl}g</span>
                </div>
                {f.tips && f.tips.length>0 && (
                  <div style={{marginTop:7,paddingTop:7,borderTop:"1px solid var(--s4)"}}>
                    {f.tips.map((tip,i)=><div key={i} style={{fontSize:10,color:"var(--tm)",marginBottom:2}}>💡 {tip}</div>)}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── TODAY TAB ────────────────────────────────────────────────────────────────
function TodayTab({ S, upd, myMacros, m, onOpenRecipe }) {
  const t = ["b","l","d"].reduce((acc,k)=>{const mx=myMacros(S.today[k],k);return{kc:acc.kc+mx.kc,pr:acc.pr+mx.pr,gl:acc.gl+mx.gl,li:acc.li+mx.li};},{kc:0,pr:0,gl:0,li:0});
  const regen = (k) => upd(s => {
    const pool = getPool(k, s.dayType, s.today[k].ctx||"home", s.fixedBreakfastId, k==="b");
    const cur = s.today[k].recipe;
    const excl = [...(s.disliked||[]), ...(cur?.id ? [cur.id] : [])];
    const next = pick(pool, excl, s.liked||[]);
    if (next) s.today[k] = {...s.today[k], recipe:next};
  });

  // ── Calcul du signal calorique ──
  const pct      = t.kc / m.kc;           // ratio consommé / cible
  const deficit  = m.kc - t.kc;           // positif = encore de la marge, négatif = dépassement
  const overPct  = Math.max(0, pct - 1);  // % de dépassement au-delà de 100%

  // Seuils : vert <90%, jaune 90-100%, orange 100-110%, rouge >110%
  const barColor = (id, val, tgt) => {
    if (id !== "kc") return val > tgt * 1.1 ? "var(--re)" : val > tgt ? "var(--or)" : "var(--bl)";
    if (pct > 1.10) return "var(--re)";
    if (pct > 1.00) return "var(--or)";
    if (pct > 0.90) return "var(--ac)";
    return "var(--ac)";
  };

  // Message d'alerte contextuel
  const alertMsg = () => {
    if (pct > 1.15) return { col:"var(--re)",  bg:"rgba(255,92,92,.08)",  icon:"🚨", txt:`Dépassement de ${Math.abs(deficit)} kcal — objectif perte de poids compromis aujourd'hui.` };
    if (pct > 1.05) return { col:"var(--or)",  bg:"rgba(255,154,60,.08)", icon:"⚠️", txt:`+${Math.abs(deficit)} kcal au-dessus de la cible — léger dépassement, ajuste le dîner si possible.` };
    if (pct > 0.95) return { col:"var(--ac)",  bg:"var(--acb)",           icon:"✅", txt:`Dans la cible — déficit maintenu, objectif sur la bonne voie.` };
    if (pct > 0.75) return { col:"var(--ac)",  bg:"var(--acb)",           icon:"🎯", txt:`${deficit} kcal de marge — bon déficit, bien réparti sur la journée.` };
    return               { col:"var(--bl)",  bg:"rgba(92,184,255,.08)",  icon:"📉", txt:`${deficit} kcal de marge — déficit important, assure-toi de bien récupérer.` };
  };
  const alert = alertMsg();

  // Barre calories avec overflow visuel
  const kcalWidth  = Math.min(100, Math.round(pct * 100));
  const overWidth  = Math.min(25, Math.round(overPct * 100)); // barre rouge overflow max 25%

  return (
    <div>
      <Card>
        <div className="syne" style={{fontSize:15,fontWeight:700,marginBottom:12}}>
          Ma journée <span style={{fontSize:10,padding:"3px 8px",borderRadius:100,background:"var(--acb)",color:"var(--ac)",fontFamily:"DM Sans"}}>{m.kc} kcal · {m.lbl}</span>
        </div>

        {/* Barre calories avec signal overflow */}
        <div style={{marginBottom:12}}>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:4,color:"var(--tm)"}}>
            <span>Calories</span>
            <span style={{color: pct>1?"var(--re)":pct>0.9?"var(--ac)":"var(--t)", fontWeight:700}}>
              {t.kc} / {m.kc} kcal
              {pct>1 && <span style={{marginLeft:6,fontSize:11,color:"var(--re)"}}>+{Math.abs(deficit)} kcal</span>}
            </span>
          </div>
          <div style={{height:8,background:"var(--s3)",borderRadius:4,overflow:"hidden",position:"relative"}}>
            <div style={{height:"100%",width:`${kcalWidth}%`,background: pct>1.1?"var(--re)":pct>1?"var(--or)":"var(--ac)",borderRadius:4,transition:"width .5s ease"}}/>
            {overWidth>0 && (
              <div style={{position:"absolute",top:0,right:0,height:"100%",width:`${overWidth}%`,background:"var(--re)",opacity:.4,borderRadius:"0 4px 4px 0"}}/>
            )}
          </div>
        </div>

        {/* Barres macros */}
        {[["pr","Protéines",t.pr,m.pr,"g"],["gl","Glucides",t.gl,m.gl,"g"],["li","Lipides",t.li,m.li,"g"]].map(([id,lbl,val,tgt,u])=>{
          const p2=val/tgt; const col2=val>tgt*1.1?"var(--re)":val>tgt?"var(--or)":id==="pr"?"var(--bl)":id==="gl"?"var(--or)":"var(--re)";
          return (
            <div key={id} style={{marginBottom:8}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:3,color:"var(--tm)"}}>
                <span>{lbl}</span><span style={{color:val>tgt?"var(--or)":"var(--t)",fontWeight:600}}>{val} / {tgt} {u}</span>
              </div>
              <div style={{height:5,background:"var(--s3)",borderRadius:3,overflow:"hidden"}}>
                <div style={{height:"100%",width:`${Math.min(100,Math.round(p2*100))}%`,background:col2,borderRadius:3,transition:"width .5s"}}/>
              </div>
            </div>
          );
        })}

        {/* Alerte contextuelle */}
        <div style={{display:"flex",alignItems:"flex-start",gap:10,marginTop:12,padding:"10px 12px",background:alert.bg,borderRadius:"var(--rs)",border:`1px solid ${alert.col}30`}}>
          <span style={{fontSize:16,flexShrink:0}}>{alert.icon}</span>
          <span style={{fontSize:12,color:alert.col,lineHeight:1.5}}>{alert.txt}</span>
        </div>

        <div style={{fontSize:11,color:"var(--tm)",marginTop:8}}>
          Multiplicateur portion : <strong style={{color:"var(--ac)"}}>{(S.mult||1).toFixed(2)}×</strong>
          {(S.bMult??1)!==1 && <span> · Petit-déj : <strong style={{color:"var(--or)"}}>{(S.bMult??1).toFixed(1)}×</strong></span>}
        </div>
      </Card>

      <BreakfastSelector S={S} upd={upd} />
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:13}}>
        {[{k:"b",icon:"🌅",lbl:"Petit-déjeuner",place:"Maison"},{k:"l",icon:"☀️",lbl:"Déjeuner",place:"Self"},{k:"d",icon:"🌙",lbl:"Dîner",place:"Maison"}].map(def=>{
          const slot=S.today[def.k]; const recipe=slot.recipe; const convs=slot.convives||["moi"];
          const factor=totalFactor(convs,S.coeffs); const myM=myMacros(slot,def.k);
          const isLiked=(S.liked||[]).includes(recipe?.id);
          return (
            <div key={def.k} style={{background:"var(--s2)",border:"1px solid var(--s4)",borderRadius:"var(--r)",padding:16}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                <span style={{fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:10,textTransform:"uppercase",letterSpacing:1,color:"var(--tm)"}}>{def.icon} {def.lbl}<br/>{def.place}</span>
                {recipe && <span style={{fontSize:12,color:"var(--ac)",fontWeight:700}}>{myM.kc} kcal</span>}
              </div>
              {recipe ? <>
                <button
                  onClick={()=>onOpenRecipe&&onOpenRecipe({recipe,convives:convs})}
                  style={{width:"100%",textAlign:"left",background:"var(--s3)",border:"1px solid var(--s4)",borderRadius:"var(--rs)",padding:"10px 12px",cursor:"pointer",marginBottom:10,transition:"border-color .2s"}}>
                  <div style={{fontSize:15,fontWeight:700,color:"var(--t)",marginBottom:3}}>{recipe.n||recipe.name}</div>
                  <div style={{fontSize:10,padding:"2px 7px",borderRadius:100,background:"var(--s2)",color:"var(--tm)",display:"inline-block",marginBottom:5}}>{recipe.t}</div>
                  <div style={{fontSize:12,color:"var(--tm)",lineHeight:1.5}}>{adaptDesc(recipe, factor * (def.k==="b" ? (S.bMult??1.0) : 1))}</div>
                  <div style={{fontSize:10,color:"var(--ac)",marginTop:6,fontWeight:600}}>👆 Voir la recette →</div>
                </button>
                <div style={{display:"flex",gap:6,marginBottom:10}}>
                  {[["P",myM.pr,"var(--bl)"],["G",myM.gl,"var(--or)"],["L",myM.li,"var(--re)"]].map(([l,v,c])=>(
                    <span key={l} style={{fontSize:11,padding:"3px 8px",borderRadius:4,background:`${c}18`,color:c,fontWeight:600}}>{l} {v}g</span>
                  ))}
                  <span style={{fontSize:11,padding:"3px 8px",borderRadius:4,background:"var(--acb)",color:"var(--ac)",fontWeight:600}}>Ma portion</span>
                </div>
                <div style={{background:"var(--s3)",borderRadius:"var(--rs)",padding:9,marginBottom:10}}>
                  <div style={{fontSize:10,textTransform:"uppercase",letterSpacing:1,color:"var(--tm)",marginBottom:6,fontFamily:"Syne,sans-serif",fontWeight:700}}>Convives</div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                    {S.convDefs.filter(c=>S.convDefs.map(x=>x.id).includes(c.id)).map(c=>{
                      const on=convs.includes(c.id);
                      return <button key={c.id} onClick={()=>{if(c.id==="moi")return;upd(s=>{const cv=[...s.today[def.k].convives];const i=cv.indexOf(c.id);if(i>-1)cv.splice(i,1);else cv.push(c.id);s.today[def.k].convives=cv;});}}
                        style={{padding:"3px 9px",borderRadius:100,border:`1px solid ${on?"var(--ac)":"var(--s4)"}`,background:on?"var(--acb)":"transparent",color:on?"var(--ac)":"var(--tm)",fontSize:11,cursor:"pointer"}}>
                        {c.emoji} {c.name}
                      </button>;
                    })}
                  </div>
                  <div style={{fontSize:11,color:"var(--tm)",marginTop:5}}>Facteur : <strong style={{color:"var(--ac)"}}>{factor.toFixed(2)}</strong> portion(s)</div>
                </div>
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  <button onClick={()=>{upd(s=>{if(!(s.liked||[]).includes(recipe.id)){s.liked=(s.liked||[]);s.liked.push(recipe.id);}});}} style={{...btnSmSty,color:isLiked?"var(--ac)":"var(--tm)",borderColor:isLiked?"var(--ac)":"var(--s4)"}}>👍 {isLiked?"Liké":"J'aime"}</button>
                  <button onClick={()=>{upd(s=>{if(!(s.disliked||[]).includes(recipe.id)){s.disliked=(s.disliked||[]);s.disliked.push(recipe.id);}});regen(def.k);}} style={btnSmSty}>👎 Pas fan</button>
                  <button onClick={()=>regen(def.k)} style={{...btnSmSty,background:"var(--ac)",color:"#000",borderColor:"var(--ac)",fontWeight:600}}>🔄 Autre</button>
                </div>
              </> : <div style={{color:"var(--tm)",fontSize:13}}>Pas de repas planifié — <button onClick={()=>regen(def.k)} style={{color:"var(--ac)",background:"none",border:"none",cursor:"pointer",fontSize:13}}>Générer →</button></div>}
            </div>
          );
        })}
      </div>

      <div style={{display:"flex",alignItems:"center",gap:8,padding:"11px 14px",background:"var(--s2)",borderRadius:"var(--r)",marginTop:10,flexWrap:"wrap"}}>
        <span style={{fontSize:13,flex:1,minWidth:140}}>📝 Portion ce soir ?</span>
        {[["small","Trop petite ↑","var(--bl)"],["ok","Ok ✓","var(--ac)"],["big","Trop grande ↓","var(--or)"]].map(([type,lbl,col])=>(
          <button key={type} onClick={()=>upd(s=>{if(type==="small")s.mult=Math.min(1.6,+(s.mult+.05).toFixed(2));if(type==="big")s.mult=Math.max(.7,+(s.mult-.05).toFixed(2));})}
            style={{padding:"6px 11px",borderRadius:6,border:"1px solid var(--s4)",background:"transparent",color:"var(--tm)",cursor:"pointer",fontSize:12}}>
            {lbl}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── COURSES TAB ──────────────────────────────────────────────────────────────
function CoursesTab({ S }) {
  const agg = {};
  const addIng = (recipe, convives, label) => {
    if (!recipe?.ing) return;
    const f = totalFactor(convives, S.coeffs) * (S.mult||1);
    recipe.ing.forEach(ing => {
      const k = ing.n.toLowerCase();
      if (!agg[k]) agg[k] = { name:ing.n, total:0, unit:ing.u, meals:[] };
      agg[k].total += ing.base * f;
      agg[k].meals.push(label);
    });
  };
  // Today
  const slotLabels = {b:"Auj. 🌅",l:"Auj. ☀️",d:"Auj. 🌙"};
  ["b","l","d"].forEach(k => addIng(S.today[k].recipe, S.today[k].convives||["moi"], slotLabels[k]));
  // Week
  Object.entries(S.week).forEach(([key,slot]) => {
    if(!slot?.recipe) return;
    const [di,k]=key.split("-"); const sIcon={b:"🌅",l:"☀️",d:"🌙"}[k];
    addIng(slot.recipe, slot.convives||["moi"], `${DAYS[parseInt(di)]} ${sIcon}`);
  });

  const CATS = {
    "🥩 Viandes & Poissons":["poulet","steak","boeuf","filet","thon","saumon","crevettes","jambon"],
    "🥦 Légumes":["courgettes","poivrons","brocolis","épinards","haricots","tomates","champignons","carottes","salade"],
    "🫘 Féculents":["riz","quinoa","lentilles","flocons","patates","pommes de terre"],
    "🥛 Laitages & Oeufs":["fromage blanc","yaourt","oeufs","avocat","myrtilles","amandes","noix"],
    "🫙 Épicerie":["moutarde","huile","bouillon","herbes"],
  };
  const catOf = (name) => { const n=name.toLowerCase(); for(const[cat,kws]of Object.entries(CATS)){if(kws.some(k=>n.includes(k)))return cat;} return "🧺 Autre"; };
  const grouped = {};
  Object.values(agg).forEach(it=>{const c=catOf(it.name);if(!grouped[c])grouped[c]=[];grouped[c].push(it);});

  const copy = () => {
    let txt = "LISTE DE COURSES — NutriCoach\n\n";
    Object.entries(grouped).forEach(([cat,items])=>{
      txt+=`${cat}\n`;
      items.forEach(it=>{txt+=`• ${it.name} — ${Math.ceil(it.total)}${it.unit||" pièce(s)"}\n`;});
      txt+="\n";
    });
    try { navigator.clipboard.writeText(txt); } catch(e) { console.log(txt); }
  };

  if (Object.keys(agg).length===0) return (
    <Card><div style={{textAlign:"center",color:"var(--tm)",padding:24}}>Planifie des repas dans Semaine pour générer la liste de courses.</div></Card>
  );

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,flexWrap:"wrap",gap:8}}>
        <div>
          <h2 style={{fontSize:19,fontFamily:"Syne,sans-serif"}}>🛒 Liste de courses</h2>
          <div style={{fontSize:12,color:"var(--tm)",marginTop:2}}>{Object.values(S.week).filter(s=>s?.recipe).length} repas planifiés · quantités adaptées par convives</div>
        </div>
        <button onClick={copy} style={{padding:"7px 14px",background:"var(--ac)",color:"#000",border:"none",borderRadius:"var(--rs)",fontWeight:600,fontSize:12,cursor:"pointer"}}>📋 Copier</button>
      </div>
      <Card>
        {Object.entries(grouped).map(([cat,items])=>(
          <div key={cat} style={{marginBottom:18}}>
            <div style={{fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:11,textTransform:"uppercase",letterSpacing:1,color:"var(--tm)",marginBottom:8,paddingBottom:6,borderBottom:"1px solid var(--s4)"}}>{cat}</div>
            {items.map((it,i)=>(
              <div key={i} style={{display:"flex",alignItems:"flex-start",gap:9,padding:"6px 0",borderBottom:"1px solid var(--s3)"}}>
                <input type="checkbox" style={{accentColor:"var(--ac)",width:14,height:14,flexShrink:0,marginTop:2}}/>
                <div style={{flex:1}}>
                  <span style={{fontSize:13}}>{it.name}</span>
                  <div style={{fontSize:10,color:"var(--tm)"}}>{[...new Set(it.meals)].slice(0,4).join(", ")}</div>
                </div>
                <span style={{fontSize:11,color:"var(--ac)",fontWeight:600,whiteSpace:"nowrap"}}>{Math.ceil(it.total)}{it.unit||" pièce(s)"}</span>
              </div>
            ))}
          </div>
        ))}
      </Card>
    </div>
  );
}

// ─── BATCH TAB ────────────────────────────────────────────────────────────────
function BatchTab() {
  return (
    <Card>
      <div className="syne" style={{fontSize:15,fontWeight:700,marginBottom:4}}>Batch Cooking Week-end <span style={{fontSize:10,padding:"3px 8px",borderRadius:100,background:"var(--acb)",color:"var(--ac)",fontFamily:"DM Sans"}}>~2h · Dimanche matin</span></div>
      <div style={{fontSize:13,color:"var(--tm)",marginBottom:16}}>Plan adapté à tes protéines préférées :</div>
      {BATCH_PLAN.map((item,i)=>(
        <div key={i} style={{display:"flex",alignItems:"flex-start",gap:11,padding:"12px 0",borderBottom:"1px solid var(--s4)"}}>
          <div style={{width:27,height:27,borderRadius:"50%",background:"var(--acb)",color:"var(--ac)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:12,flexShrink:0}}>{i+1}</div>
          <div>
            <div style={{fontSize:14,fontWeight:600,marginBottom:2}}>{item.e} {item.n} <span style={{fontSize:11,color:"var(--ac)"}}>{item.q}</span></div>
            <div style={{fontSize:12,color:"var(--tm)"}}>{item.d}</div>
          </div>
        </div>
      ))}
    </Card>
  );
}

// ─── FÊTE TAB ─────────────────────────────────────────────────────────────────
// ─── LIBRARY TAB ─────────────────────────────────────────────────────────────
function LibraryTab({ S, upd }) {
  const [filter, setFilter] = useState("all"); // all | liked | midi | soir | matin
  const [search, setSearch] = useState("");

  // Toutes les recettes en liste plate
  const ALL_RECIPES = [
    ...REC.breakfast.map(r=>({...r,cat:"matin"})),
    ...REC.lunch_train.map(r=>({...r,cat:"midi"})),
    ...REC.lunch_repos.map(r=>({...r,cat:"midi-repos"})),
    ...REC.dinner_train.map(r=>({...r,cat:"soir"})),
    ...REC.dinner_repos.map(r=>({...r,cat:"soir-repos"})),
    ...REC.fun.b.map(r=>({...r,cat:"fun"})),
    ...REC.fun.l.map(r=>({...r,cat:"fun"})),
    ...REC.fun.d.map(r=>({...r,cat:"fun"})),
    ...FIXED_BREAKFASTS.map(r=>({...r,cat:"matin"})),
  ];

  const liked = S.liked || [];
  const disliked = S.disliked || [];

  const filtered = ALL_RECIPES.filter(r => {
    if (filter === "liked" && !liked.includes(r.id)) return false;
    if (filter === "midi" && !r.cat.startsWith("midi")) return false;
    if (filter === "soir" && !r.cat.startsWith("soir")) return false;
    if (filter === "matin" && r.cat !== "matin") return false;
    if (search && !(r.n||r.name||"").toLowerCase().includes(search.toLowerCase()) && !(r.tags||[]).some(t=>t.includes(search.toLowerCase()))) return false;
    return true;
  });

  const toggleLike = (id) => upd(s => {
    const i = s.liked.indexOf(id);
    if (i > -1) s.liked.splice(i, 1); else s.liked.push(id);
    // Retirer des disliked si liké
    const j = s.disliked.indexOf(id);
    if (j > -1) s.disliked.splice(j, 1);
  });

  const toggleDislike = (id) => upd(s => {
    const i = s.disliked.indexOf(id);
    if (i > -1) s.disliked.splice(i, 1); else s.disliked.push(id);
    const j = s.liked.indexOf(id);
    if (j > -1) s.liked.splice(j, 1);
  });

  const catLabel = {matin:"🌅 Matin", midi:"☀️ Midi", "midi-repos":"☀️ Midi repos", soir:"🌙 Soir", "soir-repos":"🌙 Soir repos", fun:"🎉 Fun"};

  return (
    <div>
      <Card>
        <div className="syne" style={{fontSize:15,fontWeight:700,marginBottom:4}}>❤️ Librairie des recettes</div>
        <div style={{fontSize:12,color:"var(--tm)",marginBottom:14}}>
          Like les recettes que tu as essayées et appréciées — elles seront proposées plus souvent (×3).
        </div>

        {/* Barre recherche */}
        <input type="text" value={search} onChange={e=>setSearch(e.target.value)}
          placeholder="🔍 Rechercher une recette, un ingrédient..."
          style={{width:"100%",background:"var(--s2)",border:"1px solid var(--s4)",color:"var(--t)",borderRadius:"var(--rs)",padding:"9px 12px",fontSize:13,marginBottom:10}}/>

        {/* Filtres */}
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:14}}>
          {[["all","Toutes"],["liked","❤️ Mes likes"],["matin","🌅 Matin"],["midi","☀️ Midi"],["soir","🌙 Soir"],["fun","🎉 Fun"]].map(([v,l])=>(
            <button key={v} onClick={()=>setFilter(v)}
              style={{padding:"5px 12px",borderRadius:100,border:`1px solid ${filter===v?"var(--ac)":"var(--s4)"}`,background:filter===v?"var(--ac)":"transparent",color:filter===v?"#000":"var(--tm)",fontSize:12,cursor:"pointer"}}>
              {l}
            </button>
          ))}
        </div>

        <div style={{fontSize:11,color:"var(--tm)",marginBottom:12}}>{filtered.length} recette{filtered.length>1?"s":""} · {liked.length} liké{liked.length>1?"s":""}</div>
      </Card>

      {/* Liste recettes */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:10}}>
        {filtered.map(r => {
          const isLiked = liked.includes(r.id);
          const isDisliked = disliked.includes(r.id);
          return (
            <div key={r.id} style={{background:"var(--s1)",border:`1px solid ${isLiked?"var(--ac)":isDisliked?"var(--re)":"var(--s4)"}`,borderRadius:"var(--r)",padding:14,transition:"border-color .2s"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
                <div>
                  <div style={{fontSize:14,fontWeight:600,marginBottom:2}}>{r.n||r.name}</div>
                  <div style={{fontSize:10,padding:"2px 6px",borderRadius:100,background:"var(--s3)",color:"var(--tm)",display:"inline-block"}}>{catLabel[r.cat]||r.cat} · {r.t}</div>
                </div>
                <div style={{display:"flex",gap:6,flexShrink:0,marginLeft:8}}>
                  <button onClick={()=>toggleLike(r.id)}
                    style={{width:32,height:32,borderRadius:"50%",border:`1px solid ${isLiked?"var(--ac)":"var(--s4)"}`,background:isLiked?"var(--ac)":"transparent",fontSize:16,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
                    {isLiked?"❤️":"🤍"}
                  </button>
                  <button onClick={()=>toggleDislike(r.id)}
                    style={{width:32,height:32,borderRadius:"50%",border:`1px solid ${isDisliked?"var(--re)":"var(--s4)"}`,background:isDisliked?"rgba(255,92,92,.15)":"transparent",fontSize:16,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
                    👎
                  </button>
                </div>
              </div>
              <div style={{fontSize:11,color:"var(--tm)",marginBottom:8,lineHeight:1.5}}>{(r.d||"").replace(/\{([^}]+)\}/g,"$1")}</div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                <span style={{fontSize:10,padding:"2px 7px",borderRadius:4,background:"var(--acb)",color:"var(--ac)",fontWeight:600}}>{r.kc} kcal</span>
                <span style={{fontSize:10,padding:"2px 7px",borderRadius:4,background:"rgba(92,184,255,.12)",color:"var(--bl)",fontWeight:600}}>P {r.pr}g</span>
                {(r.tags||[]).map(tag=><span key={tag} style={{fontSize:10,padding:"2px 7px",borderRadius:4,background:"var(--s3)",color:"var(--tm)"}}>{tag}</span>)}
              </div>
              {isLiked && <div style={{fontSize:10,color:"var(--ac)",marginTop:6}}>✓ Proposée plus souvent dans le planning</div>}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div style={{gridColumn:"1/-1",textAlign:"center",padding:32,color:"var(--tm)",fontSize:13}}>
            {filter==="liked" ? "Tu n'as pas encore liké de recette. Explore et like celles que tu aimes !" : "Aucune recette trouvée."}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── FRIGO TAB ───────────────────────────────────────────────────────────────
function FrigoTab({ S, upd }) {
  const [ingredients, setIngredients] = useState("");
  const [mealType, setMealType] = useState("soir");
  const [convives, setConvives] = useState(S.selectedConvs||["moi"]);
  const [results, setResults] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [searched, setSearched] = useState(false);

  const POOLS = {
    matin: [...(REC.breakfast||[]), ...FIXED_BREAKFASTS],
    midi:  [...(REC.lunch_train||[]), ...(REC.lunch_repos||[])],
    soir:  [...(REC.dinner_train||[]), ...(REC.dinner_repos||[])],
    fun:   [...(REC.fun?.b||[]), ...(REC.fun?.l||[]), ...(REC.fun?.d||[])],
  };

  const findRecipes = () => {
    const pool = POOLS[mealType] || POOLS.soir;
    const terms = ingredients.toLowerCase().split(/[,;\n ]+/).map(s=>s.trim()).filter(s=>s.length>2);
    const liked = S.liked||[];

    let finalPool;
    if (terms.length === 0) {
      // Sans ingrédients : proposer toutes les recettes pondérées par likes
      finalPool = [...pool];
    } else {
      const scored = pool.map(r => {
        const text = [
          r.n||r.name||"",
          r.d||"",
          ...(r.tags||[]),
          ...(r.ing||[]).map(i=>i.n||"")
        ].join(" ").toLowerCase();
        const matched = terms.filter(t => text.includes(t));
        return { r, score: matched.length };
      });
      const withScore = scored.filter(x=>x.score>0).sort((a,b)=>b.score-a.score).map(x=>x.r);
      finalPool = withScore.length > 0 ? withScore : [...pool];
    }

    // Trier avec pondération likes + aléatoire
    const shuffled = [...finalPool].sort((a,b) => {
      const wa = liked.includes(a.id) ? 3 : 1;
      const wb = liked.includes(b.id) ? 3 : 1;
      return (Math.random()*2-1) + (wb-wa)*0.5;
    });

    setResults(shuffled);
    setCurrentIdx(0);
    setSearched(true);
  };

  const coeffs = S.coeffs || {};
  const factor = Math.max(0.1, totalFactor(convives, coeffs));
  const current = results[currentIdx];

  const nextRecipe = () => {
    if (currentIdx < results.length - 1) setCurrentIdx(i=>i+1);
    else { setResults([]); setCurrentIdx(0); setSearched(false); }
  };

  const addToPlanning = () => {
    if (!current) return;
    const slotKey = mealType==="matin"?"b":mealType==="midi"?"l":"d";
    const key = `${TODAY_IDX}-${slotKey}`;
    upd(s=>{ s.week[key]={recipe:current,ctx:"home",convives:[...convives]}; s.activeTab="week"; });
  };

  const termList = ingredients.toLowerCase().split(/[,;\n ]+/).map(s=>s.trim()).filter(s=>s.length>2);

  return (
    <div>
      <Card>
        <div className="syne" style={{fontSize:15,fontWeight:700,marginBottom:4}}>🧊 Que faire avec mon frigo ?</div>
        <div style={{fontSize:12,color:"var(--tm)",marginBottom:16}}>Indique ce que tu as, choisis le type de repas — je te propose une recette adaptée.</div>

        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:12,marginBottom:14}}>
          {/* Type de repas */}
          <div>
            <div style={{fontSize:11,textTransform:"uppercase",letterSpacing:1,color:"var(--tm)",marginBottom:7,fontFamily:"Syne,sans-serif",fontWeight:700}}>Type de repas</div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {[["matin","🌅 Matin"],["midi","☀️ Midi"],["soir","🌙 Soir"],["fun","🎉 Fun"]].map(([v,l])=>(
                <button key={v} onClick={()=>setMealType(v)}
                  style={{padding:"6px 12px",borderRadius:100,border:`1px solid ${mealType===v?"var(--ac)":"var(--s4)"}`,background:mealType===v?"var(--ac)":"transparent",color:mealType===v?"#000":"var(--tm)",fontSize:12,cursor:"pointer",transition:"all .2s"}}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Convives */}
          <div>
            <div style={{fontSize:11,textTransform:"uppercase",letterSpacing:1,color:"var(--tm)",marginBottom:7,fontFamily:"Syne,sans-serif",fontWeight:700}}>Convives</div>
            <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
              {(S.convDefs||[]).map(c=>{
                const on = convives.includes(c.id);
                return (
                  <button key={c.id}
                    onClick={()=>setConvives(p=> on && c.id!=="moi" ? p.filter(x=>x!==c.id) : p.includes(c.id) ? p : [...p,c.id])}
                    style={{padding:"4px 9px",borderRadius:100,border:`1px solid ${on?"var(--ac)":"var(--s4)"}`,background:on?"var(--acb)":"transparent",color:on?"var(--ac)":"var(--tm)",fontSize:11,cursor:"pointer"}}>
                    {c.emoji} {c.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Ingrédients */}
        <div style={{marginBottom:14}}>
          <div style={{fontSize:11,textTransform:"uppercase",letterSpacing:1,color:"var(--tm)",marginBottom:7,fontFamily:"Syne,sans-serif",fontWeight:700}}>
            Ingrédients disponibles <span style={{fontWeight:400,textTransform:"none",letterSpacing:0}}>(optionnel — séparés par virgule)</span>
          </div>
          <textarea value={ingredients} onChange={e=>setIngredients(e.target.value)}
            placeholder="Ex: poulet, courgettes, lentilles, oeufs, saumon..."
            style={{width:"100%",background:"var(--s2)",border:"1px solid var(--s4)",color:"var(--t)",borderRadius:"var(--rs)",padding:"10px 12px",fontSize:13,resize:"vertical",minHeight:75,fontFamily:"DM Sans,sans-serif"}}/>
        </div>

        <Btn onClick={findRecipes}>🔍 Trouver une recette</Btn>
      </Card>

      {/* Résultat */}
      {current && (
        <Card>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
            <div style={{fontSize:11,color:"var(--tm)"}}>Recette {currentIdx+1} / {results.length}</div>
            {(S.liked||[]).includes(current.id) && <div style={{fontSize:11,color:"var(--ac)"}}>❤️ Tu aimes cette recette</div>}
          </div>

          <div style={{fontSize:18,fontWeight:700,marginBottom:4}}>{current.n||current.name}</div>
          <div style={{fontSize:10,padding:"2px 7px",borderRadius:100,background:"var(--s3)",color:"var(--tm)",display:"inline-block",marginBottom:10}}>{current.t||""}</div>

          <div style={{fontSize:13,color:"var(--tm)",marginBottom:12,lineHeight:1.6}}>
            {adaptDesc(current, factor)}
          </div>

          {/* Macros */}
          <div style={{display:"flex",gap:6,marginBottom:14,flexWrap:"wrap"}}>
            <span style={{fontSize:11,padding:"3px 8px",borderRadius:4,background:"var(--acb)",color:"var(--ac)",fontWeight:600}}>{Math.round((current.kc||0)*(S.mult||1))} kcal</span>
            <span style={{fontSize:11,padding:"3px 8px",borderRadius:4,background:"rgba(92,184,255,.12)",color:"var(--bl)",fontWeight:600}}>P {Math.round((current.pr||0)*(S.mult||1))}g</span>
            <span style={{fontSize:11,color:"var(--tm)",alignSelf:"center"}}>{factor.toFixed(1)} portion(s) au total</span>
          </div>

          {/* Ingrédients avec disponibilité */}
          {(current.ing||[]).length > 0 && (
            <div style={{marginBottom:14,background:"var(--s2)",borderRadius:"var(--rs)",padding:12}}>
              <div style={{fontSize:11,textTransform:"uppercase",letterSpacing:1,color:"var(--tm)",marginBottom:8,fontFamily:"Syne,sans-serif",fontWeight:700}}>Ingrédients nécessaires</div>
              {current.ing.map((ing,i)=>{
                const qty = Math.ceil((ing.base||0) * factor * (S.mult||1));
                const ingName = (ing.n||"").toLowerCase();
                const userHas = termList.length === 0 || termList.some(t => ingName.includes(t) || t.includes(ingName.split(" ")[0]));
                return (
                  <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"5px 0",borderBottom:"1px solid var(--s3)"}}>
                    <span style={{fontSize:15,flexShrink:0}}>{termList.length===0?"✅":userHas?"✅":"⬜"}</span>
                    <span style={{flex:1,fontSize:13,color:termList.length===0||userHas?"var(--t)":"var(--or)"}}>{ing.n}</span>
                    <span style={{fontSize:12,color:"var(--ac)",fontWeight:600,whiteSpace:"nowrap"}}>{qty}{ing.u?` ${ing.u}`:""}</span>
                  </div>
                );
              })}
              {termList.length > 0 && (current.ing||[]).some(ing=>!termList.some(t=>(ing.n||"").toLowerCase().includes(t)||t.includes((ing.n||"").toLowerCase().split(" ")[0]))) && (
                <div style={{fontSize:11,color:"var(--or)",marginTop:8}}>⬜ Ingrédients non disponibles dans ta liste — achète-les ou passe à la recette suivante</div>
              )}
            </div>
          )}

          {/* Actions */}
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            <button onClick={nextRecipe}
              style={{padding:"9px 16px",background:"var(--s3)",border:"1px solid var(--s4)",color:"var(--t)",borderRadius:6,fontSize:12,cursor:"pointer",fontWeight:600}}>
              {currentIdx < results.length-1 ? "⬜ Il me manque des ingrédients → recette suivante" : "🔄 Recommencer"}
            </button>
            <Btn onClick={addToPlanning}>+ Ajouter au planning</Btn>
          </div>
        </Card>
      )}

      {searched && results.length === 0 && (
        <Card>
          <div style={{textAlign:"center",padding:16,color:"var(--tm)",fontSize:13}}>
            Aucune recette trouvée. Essaie avec d'autres ingrédients ou un type de repas différent.
          </div>
        </Card>
      )}
    </div>
  );
}

function FeteTab() {
  const [type, setType] = useState("apero");
  const DATA = {
    apero: { title:"Apéritif dînatoire", intro:"Convivial, varié, sans excès mais sans frustration.", sections:[
      { title:"🥩 Bouchées protéinées", items:[{n:"Brochettes poulet mariné",tag:"Chaud",d:"Poulet cubes marinés huile-citron-herbes. Poêle ou plancha 8 min. 3-4 brochettes/pers."},{n:"Verrines thon avocat",tag:"Froid",d:"Thon naturel, avocat écrasé, citron, fleur de sel."},{n:"Oeufs mimosa",tag:"Froid",d:"Oeufs durs farcis mayo légère, herbes fraîches, câpres."}]},
      { title:"🥗 Légumes & Dips", items:[{n:"Crudités & houmous",tag:"Sans cuisson",d:"Carottes, concombre, radis, poivrons. Houmous: pois chiches, tahini, citron, ail."},{n:"Tomates cerises farcies",tag:"Léger",d:"Fromage frais herbes + saumon fumé émietté."}]},
      { title:"🧀 Fromages", items:[{n:"Petite planche fromages",tag:"Écart modéré",d:"2-3 fromages max (comté, brie, chèvre). 30g/pers. Crackers ou pain noix.", note:"Compensé sur le déjeuner du lendemain"}]},
    ]},
    fete: { title:"Repas de fête", intro:"Un vrai repas festif en 3-4 temps, tes protéines préférées habillées pour l'occasion.", sections:[
      { title:"🥗 Entrée", items:[{n:"Saumon fumé blinis",tag:"Élégant",d:"Saumon fumé 80g/pers., blinis tièdes, crème fraîche ciboule."},{n:"Velouté butternut",tag:"Chaud",d:"Butternut, oignon, crème coco légère, curry doux. Prépare la veille."}]},
      { title:"🥩 Plat", items:[{n:"Filet de boeuf herbes",tag:"Festif",d:"Rôti boeuf 200g/pers., herbes + fleur de sel. Four 200°C, 20 min saignant.", note:"Écart lipides OK pour l'occasion"},{n:"Poulet rôti entier",tag:"Classique",d:"Poulet fermier, beurre herbes sous peau, citron, ail. Four 200°C, 1h15."},{n:"Saumon sauce vierge",tag:"Léger",d:"Saumon 180g poêlé, sauce vierge tomates-câpres-basilic, haricots verts."}]},
      { title:"🍮 Dessert", items:[{n:"Mousse chocolat noir",tag:"Classique",d:"Chocolat 70%, oeufs, peu de sucre. 120g/pers. Prépare la veille.", note:"1 portion raisonnable"},{n:"Plateau fruits de saison",tag:"Option légère",d:"Fruits de saison, amandes, quelques carrés chocolat noir."}]},
    ]},
    amis: { title:"Repas entre amis", intro:"Convivial, fait pour être partagé au centre de la table.", sections:[
      { title:"🍖 Plats à partager", items:[{n:"Tajine poulet citron olives",tag:"Mijoté",d:"Cuisses poulet 200g/pers., citrons confits, olives, épices. Cocotte 1h."},{n:"Côte de boeuf partagée",tag:"Festif",d:"1 côte pour 2-3 pers. Poêle très chaude, repos 5 min. Fleur de sel.", note:"Légumes en accompagnement"},{n:"Brochettes mixtes BBQ",tag:"Convivial",d:"Poulet mariné + boeuf + crevettes. Légumes grillés. Sauce yaourt-herbes."}]},
      { title:"🥗 Accompagnements", items:[{n:"Haricots verts amandines",tag:"Léger",d:"Haricots verts vapeur, beurre noisette, amandes effilées toastées."},{n:"Grande salade verte",tag:"Sans restriction",d:"Salade fraîche, herbes variées, vinaigrette moutarde-citron. À volonté."}]},
    ]},
  };
  const d = DATA[type];
  return (
    <div>
      <Card>
        <div className="syne" style={{fontSize:15,fontWeight:700,marginBottom:12}}>Occasions spéciales 🥂</div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:16}}>
          {[["apero","🥂 Apéritif dînatoire"],["fete","🎉 Repas de fête"],["amis","👨‍👩‍👦 Entre amis"]].map(([k,l])=>(
            <button key={k} onClick={()=>setType(k)} style={{padding:"8px 16px",borderRadius:100,border:`1px solid ${type===k?"var(--ac)":"var(--s4)"}`,background:type===k?"var(--ac)":"transparent",color:type===k?"#000":"var(--tm)",fontSize:13,cursor:"pointer",transition:"all .2s"}}>{l}</button>
          ))}
        </div>
        <div style={{fontSize:13,color:"var(--tm)",marginBottom:16,padding:12,background:"var(--s2)",borderRadius:"var(--rs)"}}><strong style={{color:"var(--t)"}}>{d.title}</strong> — {d.intro}</div>
        {d.sections.map((sec,si)=>(
          <div key={si} style={{marginBottom:18}}>
            <div style={{fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:12,textTransform:"uppercase",letterSpacing:1,color:"var(--tm)",marginBottom:9,paddingBottom:6,borderBottom:"1px solid var(--s4)"}}>{sec.title}</div>
            {sec.items.map((item,ii)=>(
              <div key={ii} style={{background:"var(--s2)",border:"1px solid var(--s4)",borderRadius:"var(--r)",padding:13,marginBottom:8}}>
                <div style={{fontSize:14,fontWeight:600,marginBottom:3}}>{item.n}</div>
                <div style={{fontSize:10,padding:"2px 7px",borderRadius:100,background:"rgba(255,154,60,.15)",color:"var(--or)",display:"inline-block",marginBottom:6}}>{item.tag}</div>
                <div style={{fontSize:12,color:"var(--tm)"}}>{item.d}</div>
                {item.note && <div style={{fontSize:11,color:"var(--or)",marginTop:5}}>⚠️ {item.note}</div>}
              </div>
            ))}
          </div>
        ))}
        <div style={{padding:12,background:"var(--s2)",borderRadius:"var(--rs)",fontSize:12,color:"var(--tm)"}}>
          💡 <strong style={{color:"var(--t)"}}>Stratégie lendemain :</strong> Jour repos calorique, repas légers protéinés. Un écart ponctuel ne compromet pas un objectif sur la durée.
        </div>
      </Card>
    </div>
  );
}

// ─── SELF TAB ─────────────────────────────────────────────────────────────────
function SelfTab({ S }) {
  const [prots, setProts] = useState([]);
  const [fecs, setFecs] = useState([]);
  const [legs, setLegs] = useState([]);
  const [des, setDes] = useState([]);
  const [reco, setReco] = useState(null);
  const toggle = (arr, setArr, v) => setArr(p=>p.includes(v)?p.filter(x=>x!==v):[...p,v]);
  const isR = S.dayType==="repos";

  const gen = () => {
    const ps={"Poulet rôti":5,"Saumon grillé":5,"Thon":5,"Boeuf":4,"Crevettes":4,"Oeufs":3,"Porc maigre":3};
    const sp=[...prots].sort((a,b)=>(ps[b]||1)-(ps[a]||1));
    const bp=sp[0]||"protéine disponible"; const ap=sp[1]||bp;
    const bf=isR?"":(fecs.includes("Quinoa")?"Quinoa":fecs.includes("Lentilles")?"Lentilles":fecs.includes("Riz")?"Riz":fecs[0]||"");
    const bl=legs.includes("Légumes verts")?"Légumes verts":legs.includes("Salade verte")?"Salade verte":legs[0]||"légumes";
    const bd=des.includes("Fruit")?"Fruit":des.includes("Yaourt nature")?"Yaourt nature":"";
    setReco({bp,ap,bf,bl,bd,pain:fecs.includes("Pain")});
  };

  const SelfGroup = ({title,opts,state,setState}) => (
    <div style={{background:"var(--s2)",borderRadius:"var(--r)",padding:12}}>
      <div style={{fontSize:10,textTransform:"uppercase",letterSpacing:1,color:"var(--tm)",marginBottom:8,fontFamily:"Syne,sans-serif",fontWeight:700}}>{title}</div>
      {opts.map(o=>(
        <div key={o} style={{display:"flex",alignItems:"center",gap:7,padding:"5px 0",borderBottom:"1px solid var(--s4)"}}>
          <input type="checkbox" checked={state.includes(o)} onChange={()=>toggle(state,setState,o)} style={{accentColor:"var(--ac)"}}/>
          <label style={{fontSize:13,cursor:"pointer"}}>{o}</label>
        </div>
      ))}
    </div>
  );

  return (
    <Card>
      <div className="syne" style={{fontSize:15,fontWeight:700,marginBottom:4}}>Self entreprise <span style={{fontSize:10,padding:"3px 8px",borderRadius:100,background:"var(--acb)",color:"var(--ac)",fontFamily:"DM Sans"}}>Midi</span></div>
      <div style={{fontSize:13,color:"var(--tm)",marginBottom:12}}>Coche ce qui est disponible aujourd'hui :</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:10,marginBottom:12}}>
        <SelfGroup title="Protéines" opts={["Poulet rôti","Saumon grillé","Thon","Boeuf","Oeufs","Porc maigre"]} state={prots} setState={setProts}/>
        <SelfGroup title="Féculents" opts={["Riz","Pâtes","Quinoa","Lentilles","Pomme de terre","Pain"]} state={fecs} setState={setFecs}/>
        <SelfGroup title="Légumes" opts={["Légumes verts","Salade verte","Crudités","Soupe"]} state={legs} setState={setLegs}/>
        <SelfGroup title="Dessert" opts={["Fruit","Yaourt nature","Fromage","Dessert sucré"]} state={des} setState={setDes}/>
      </div>
      <Btn onClick={gen}>Voir la recommandation →</Btn>
      {reco && (
        <div style={{marginTop:14}}>
          {[["best","var(--ac)","⭐ Meilleur choix",`${reco.bp}${reco.bf?" · "+reco.bf:""} · ${reco.bl}${reco.bd?" · "+reco.bd:""}`],
            ["good","var(--or)","👍 Bon compromis",`${reco.ap} · ${reco.bl} · ${reco.bd||"sans dessert"}`],
            ["fun","var(--re)","😋 Plaisir contrôlé",`${reco.bp} · ${fecs[0]||"légumes"} · ${reco.bd||"fruit"}`]
          ].map(([k,col,lbl,txt])=>(
            <div key={k} style={{padding:12,borderRadius:"var(--r)",border:`1px solid ${col}`,background:`${col}08`,marginBottom:9}}>
              <div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:1,color:col,marginBottom:4}}>{lbl}</div>
              <div style={{fontSize:13}}>{txt}</div>
            </div>
          ))}
          {reco.pain && <div style={{fontSize:12,color:"var(--or)",marginTop:6}}>⚠️ Pain dispo → passe-t-en si possible. 1 tranche max.</div>}
          {isR && <div style={{fontSize:12,color:"var(--bl)",marginTop:6}}>😴 Jour repos → protéines + légumes, sans féculents.</div>}
        </div>
      )}
    </Card>
  );
}

// ─── RESTO TAB ────────────────────────────────────────────────────────────────
function RestoTab({ S }) {
  const [menu, setMenu] = useState(""); const [reco, setReco] = useState(null);
  const isR = S.dayType==="repos";
  const score = (l) => {
    const s=l.toLowerCase(); let p=0;
    if(/saumon|thon|dorade|bar/.test(s))p+=5; if(/poulet|volaille/.test(s))p+=4;
    if(/boeuf|steak|tartare|entrecôte/.test(s))p+=3; if(/porc|filet|côte/.test(s))p+=3;
    if(/crevette/.test(s))p+=4; if(/grillé|vapeur|rôti|plancha/.test(s))p+=2;
    if(/salade|légume|haricot|épinard/.test(s))p+=2; if(/lentille|quinoa/.test(s))p+=2;
    if(/frites|pizza|burger|tartiflette/.test(s))p-=2;
    if(/fromage|brie/.test(s)&&isR)p-=3; if(/tiramisu|moelleux|fondant/.test(s))p-=1;
    if(/abat|rognon|foie|tofu/.test(s))p-=5;
    return p;
  };
  const analyze = () => {
    const lines=menu.split(/[\/\n,;]/).map(l=>l.trim()).filter(Boolean);
    const scored=lines.map(l=>({l,p:score(l)})).sort((a,b)=>b.p-a.p);
    setReco(scored);
  };
  return (
    <Card>
      <div className="syne" style={{fontSize:15,fontWeight:700,marginBottom:4}}>Je suis au restaurant 🍽️</div>
      <div style={{fontSize:13,color:"var(--tm)",marginBottom:12}}>Colle le menu (plats séparés par / ou retour à la ligne) :</div>
      <textarea value={menu} onChange={e=>setMenu(e.target.value)} placeholder="Ex: Steak tartare / Magret de canard / Saumon grillé légumes / Côte de porc moutarde..."
        style={{width:"100%",background:"var(--s2)",border:"1px solid var(--s4)",color:"var(--t)",borderRadius:"var(--rs)",padding:12,fontSize:13,resize:"vertical",minHeight:100,marginBottom:11}}/>
      <Btn onClick={analyze}>Analyser le menu →</Btn>
      {reco && (
        <div style={{marginTop:14}}>
          {[["var(--ac)","⭐ Meilleur choix","Protéines + légumes. Sauce à part."],
            ["var(--or)","👍 Bon compromis","Bon compromis. Limite le pain."],
            ["var(--re)","😋 Plaisir contrôlé","Acceptable. Dîner léger après."]
          ].map(([col,lbl,tip],i)=>{
            const item=reco[i]; if(!item) return null;
            return (
              <div key={i} style={{padding:12,borderRadius:"var(--r)",border:`1px solid ${col}`,background:`${col}08`,marginBottom:9}}>
                <div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:1,color:col,marginBottom:4}}>{lbl}</div>
                <div style={{fontSize:14,fontWeight:500,marginBottom:4}}>{item.l}</div>
                <div style={{fontSize:11,color:"var(--tm)"}}>{tip}</div>
              </div>
            );
          })}
          <div style={{padding:10,background:"var(--s2)",borderRadius:"var(--rs)",fontSize:12,color:"var(--tm)",marginTop:4}}>
            💡 Pas de pain · Sauces à part · Cuisson grillée ou rôtie · Dessert = fruit ou café
          </div>
        </div>
      )}
    </Card>
  );
}

// ─── PROFIL TAB ───────────────────────────────────────────────────────────────
function ProfilTab({ S, upd, storageOk }) {
  const [saved, setSaved] = useState(false);
  const flash = () => { setSaved(true); setTimeout(()=>setSaved(false), 2000); };

  const resetAll = async () => {
    if (!confirm("Réinitialiser toutes les données ?")) return;
    try { localStorage.removeItem(STORAGE_KEY); } catch(e) {}
    upd(s => { Object.assign(s, initState()); s.phase="wizard"; });
  };

  return (
    <div>
      {saved && (
        <div style={{padding:"8px 14px",background:"var(--acb)",border:"1px solid var(--ac)",borderRadius:"var(--rs)",fontSize:12,color:"var(--ac)",marginBottom:12}}>
          ✓ Paramètres sauvegardés automatiquement
        </div>
      )}

      {/* Profil physique */}
      <Card>
        <div className="syne" style={{fontSize:13,fontWeight:700,marginBottom:14}}>📊 Profil physique</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:10}}>
          {[["Poids (kg)","poids",85,1],["Taille (cm)","taille",182,1],["Multiplicateur portion","mult",1.0,.05]].map(([lbl,field,def,step])=>(
            <div key={field} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 12px",background:"var(--s2)",borderRadius:"var(--rs)"}}>
              <label style={{fontSize:13,color:"var(--tm)"}}>{lbl}</label>
              <input type="number" defaultValue={S[field]??def} step={step}
                onChange={e=>{upd(s=>{s[field]=parseFloat(e.target.value);});flash();}} style={{...inputSty,width:75}}/>
            </div>
          ))}
        </div>
      </Card>

      {/* Petit-déjeuner fixe */}
      <BreakfastSelector S={S} upd={upd}/>

      {/* Goûts */}
      <Card>
        <div className="syne" style={{fontSize:13,fontWeight:700,marginBottom:14}}>🍽️ Mes goûts & exclusions</div>
        <div style={{marginBottom:14}}>
          <div style={{fontSize:11,textTransform:"uppercase",letterSpacing:1,color:"var(--tm)",marginBottom:8}}>✅ Protéines aimées</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
            {["Poulet","Saumon","Thon","Boeuf","Porc","Oeufs","Crevettes","Dinde","Cabillaud"].map(v=>{
              const on=S.prots.includes(v);
              return <button key={v} onClick={()=>{upd(s=>{const i=s.prots.indexOf(v);if(i>-1)s.prots.splice(i,1);else s.prots.push(v);});flash();}}
                style={{padding:"5px 12px",borderRadius:100,border:`1px solid ${on?"var(--ac)":"var(--s4)"}`,background:on?"var(--ac)":"transparent",color:on?"#000":"var(--tm)",fontSize:12,cursor:"pointer"}}>{v}</button>;
            })}
          </div>
        </div>
        <div style={{marginBottom:14}}>
          <div style={{fontSize:11,textTransform:"uppercase",letterSpacing:1,color:"var(--tm)",marginBottom:8}}>❌ Exclusions</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
            {["Fruits de mer","Abats","Tofu","Aubergines","Gluten","Lactose","Porc","Noix"].map(v=>{
              const on=S.excl.includes(v);
              return <button key={v} onClick={()=>{upd(s=>{const i=s.excl.indexOf(v);if(i>-1)s.excl.splice(i,1);else s.excl.push(v);});flash();}}
                style={{padding:"5px 12px",borderRadius:100,border:`1px solid ${on?"var(--re)":"var(--s4)"}`,background:on?"var(--re)":"transparent",color:on?"#fff":"var(--tm)",fontSize:12,cursor:"pointer"}}>{v}</button>;
            })}
          </div>
        </div>
        <div>
          <div style={{fontSize:11,textTransform:"uppercase",letterSpacing:1,color:"var(--tm)",marginBottom:8}}>🍳 Style culinaire</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
            {["Simple & rapide","Cuisine française","Batch cooking","Méditerranéen","Asiatique","Épicé"].map(v=>{
              const on=S.style.includes(v);
              return <button key={v} onClick={()=>{upd(s=>{const i=s.style.indexOf(v);if(i>-1)s.style.splice(i,1);else s.style.push(v);});flash();}}
                style={{padding:"5px 12px",borderRadius:100,border:`1px solid ${on?"var(--bl)":"var(--s4)"}`,background:on?"var(--bl)":"transparent",color:on?"#000":"var(--tm)",fontSize:12,cursor:"pointer"}}>{v}</button>;
            })}
          </div>
        </div>
      </Card>

      {/* Convives */}
      <Card>
        <div className="syne" style={{fontSize:13,fontWeight:700,marginBottom:14}}>👥 Convives & coefficients</div>
        {S.convDefs.map((c,i)=>(
          <div key={c.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:"1px solid var(--s4)"}}>
            <span style={{fontSize:20,width:30}}>{c.emoji}</span>
            <div style={{flex:1}}>
              <div style={{fontSize:13,fontWeight:600}}>{c.name}</div>
              <div style={{fontSize:11,color:"var(--tm)"}}>Portion relative à la mienne</div>
            </div>
            <input type="number" value={c.coeff} step={.05} min={.2} max={1.5}
              onChange={e=>{upd(s=>{s.convDefs[i].coeff=parseFloat(e.target.value);s.coeffs[c.id]=parseFloat(e.target.value);});flash();}}
              style={{...inputSty,width:65}}/>
            {!c.fixed && (
              <button onClick={()=>{upd(s=>{s.convDefs.splice(i,1);delete s.coeffs[c.id];});flash();}}
                style={{background:"transparent",border:"none",color:"var(--re)",cursor:"pointer",fontSize:14,padding:4}}>✕</button>
            )}
          </div>
        ))}
        <div style={{marginTop:12}}>
          <AddConvForm upd={(fn)=>{upd(fn);flash();}}/>
        </div>
      </Card>

      {/* Macros cibles */}
      <Card>
        <div className="syne" style={{fontSize:13,fontWeight:700,marginBottom:14}}>🎯 Cibles macro (calculées)</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:8}}>
          {Object.entries(MACROS).map(([k,m])=>(
            <div key={k} style={{background:"var(--s2)",borderRadius:"var(--rs)",padding:"10px 12px"}}>
              <div style={{fontSize:11,fontWeight:700,color:"var(--tm)",textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>
                {k==="repos"?"😴 Repos":k==="training"?"🏃 Entraîn.":"🏔️ Sortie longue"}
              </div>
              <div style={{fontSize:13,color:"var(--t)"}}>{m.kc} kcal</div>
              <div style={{fontSize:11,color:"var(--tm)"}}>P {m.pr}g · G {m.gl}g · L {m.li}g</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Compléments */}
      <Card>
        <div className="syne" style={{fontSize:13,fontWeight:700,marginBottom:10}}>💊 Compléments (exclus des macros)</div>
        <div style={{fontSize:12,color:"var(--tm)",lineHeight:2.2}}>
          🌅 Whey 30g · Collagène · Oméga-3 · Multivitamines · Curcumine · D3+K2<br/>
          🌙 Glycine · Oméga-3 · Magnésium<br/>
          ⚡ Électrolytes Nutripure (sorties)<br/>
          🧪 Créatine 5g/j (arrêt début juillet avant Cervin)
        </div>
      </Card>

      {/* Statut sauvegarde */}
      <Card>
        <div className="syne" style={{fontSize:13,fontWeight:700,marginBottom:12}}>💾 Sauvegarde & persistance</div>
        {storageOk === true ? (
          <div>
            <div style={{display:"flex",alignItems:"center",gap:8,padding:"10px 12px",background:"rgba(200,240,85,.08)",border:"1px solid var(--ac)",borderRadius:"var(--rs)",marginBottom:10}}>
              <span style={{fontSize:18}}>✅</span>
              <div>
                <div style={{fontSize:13,fontWeight:600,color:"var(--ac)"}}>Sauvegarde automatique active</div>
                <div style={{fontSize:11,color:"var(--tm)"}}>Ton planning et ton profil sont sauvegardés à chaque modification.</div>
              </div>
            </div>
            <div style={{fontSize:12,color:"var(--tm)",lineHeight:1.8,padding:"10px 12px",background:"var(--s2)",borderRadius:"var(--rs)"}}>
              <strong style={{color:"var(--t)"}}>Comment retrouver ton planning ?</strong><br/>
              👉 Reviens dans <strong style={{color:"var(--ac)"}}>cette conversation Claude</strong> et rouvre l'artifact NutriCoach.<br/>
              👉 Ajoute cette conversation à tes <strong style={{color:"var(--ac)"}}>favoris Claude</strong> pour la retrouver facilement.<br/>
              ⚠️ Le planning est lié à cet artifact — une nouvelle conversation part de zéro.
            </div>
          </div>
        ) : storageOk === false ? (
          <div>
            <div style={{display:"flex",alignItems:"center",gap:8,padding:"10px 12px",background:"rgba(255,92,92,.08)",border:"1px solid var(--re)",borderRadius:"var(--rs)",marginBottom:10}}>
              <span style={{fontSize:18}}>⚠️</span>
              <div>
                <div style={{fontSize:13,fontWeight:600,color:"var(--re)"}}>Sauvegarde automatique non disponible</div>
                <div style={{fontSize:11,color:"var(--tm)"}}>Le storage de cet artifact n'est pas accessible dans cette session.</div>
              </div>
            </div>
            <div style={{fontSize:12,color:"var(--tm)",lineHeight:1.8,padding:"10px 12px",background:"var(--s2)",borderRadius:"var(--rs)"}}>
              <strong style={{color:"var(--t)"}}>Solution :</strong> Utilise le bouton <strong style={{color:"var(--ac)"}}>📸 Image du planning</strong> dans l'onglet Semaine pour garder une trace visuelle de ta semaine avant de fermer.
            </div>
          </div>
        ) : (
          <div style={{fontSize:12,color:"var(--tm)"}}>Vérification du statut...</div>
        )}
        <div style={{marginTop:12}}>
          <button onClick={resetAll}
            style={{padding:"8px 14px",background:"transparent",border:"1px solid var(--re)",color:"var(--re)",borderRadius:"var(--rs)",fontSize:12,cursor:"pointer"}}>
            🗑️ Réinitialiser l'app
          </button>
        </div>
      </Card>
    </div>
  );
}

// ─── SHARED COMPONENTS ────────────────────────────────────────────────────────
// ─── RECIPE MODAL ─────────────────────────────────────────────────────────────

// Génère des étapes de préparation intelligentes selon les ingrédients
function generateSteps(recipe) {
  const name = (recipe.n||recipe.name||"").toLowerCase();
  const ing = recipe.ing||[];
  const hasOeufs    = ing.some(i=>/oeuf/i.test(i.n));
  const hasSaumon   = ing.some(i=>/saumon/i.test(i.n));
  const hasPoulet   = ing.some(i=>/poulet/i.test(i.n));
  const hasBoeuf    = ing.some(i=>/steak|boeuf/i.test(i.n));
  const hasPorc     = ing.some(i=>/porc|filet mignon/i.test(i.n));
  const hasCrevette = ing.some(i=>/crevette/i.test(i.n));
  const hasThon     = ing.some(i=>/thon/i.test(i.n));
  const hasQuinoa   = ing.some(i=>/quinoa/i.test(i.n));
  const hasRiz      = ing.some(i=>/riz/i.test(i.n));
  const hasLentilles= ing.some(i=>/lentille/i.test(i.n));
  const hasPates    = ing.some(i=>/pâtes|semoule/i.test(i.n));
  const hasLegumes  = ing.some(i=>/courgette|carotte|brocoli|épinard|haricot|champignon/i.test(i.n));
  const hasPatate   = ing.some(i=>/patate|pomme de terre/i.test(i.n));
  const isBowl      = name.includes("bowl") || name.includes("salade");
  const isPapillote = name.includes("papillote");
  const isOmelette  = name.includes("omelette");
  const isTartine   = name.includes("tartine");

  const steps = [];

  // Étape 1 : Préparation des féculents (si applicable)
  if (hasQuinoa) steps.push({ icon:"🫘", title:"Cuire le quinoa", txt:"Rincer le quinoa. Couvrir de 2× son volume en eau froide. Porter à ébullition, réduire à feu doux, couvrir. Cuire 12-15 min jusqu'à absorption complète. Égrainer à la fourchette." });
  else if (hasRiz) steps.push({ icon:"🍚", title:"Cuire le riz", txt:"Rincer le riz. Couvrir de 1.5× son volume en eau. Porter à ébullition, couvrir, cuire à feu doux 12 min (basmati/jasmin) ou 25 min (complet). Ne pas soulever le couvercle." });
  else if (hasLentilles) steps.push({ icon:"🫘", title:"Cuire les lentilles", txt:"Vertes : départ eau froide, couvrir, cuire 20-25 min à frémissement. Corail : 12-15 min. Ne pas saler en début de cuisson. Égoutter." });
  else if (hasPates) steps.push({ icon:"🍝", title:"Cuire les pâtes/semoule", txt:"Pâtes : grande casserole d'eau bouillante salée, cuire al dente selon le paquet. Semoule : verser l'eau bouillante (1:1) sur la semoule, couvrir 3 min, égrainer." });
  else if (hasPatate) steps.push({ icon:"🍠", title:"Cuire les patates", txt:"Patates douces : four 200°C 25-30 min (en rondelles) ou vapeur 20 min. Pommes de terre : départ eau froide, cuire 20 min, vérifier à la pointe d'un couteau." });

  // Étape 2 : Protéine principale
  if (isPapillote && hasSaumon) {
    steps.push({ icon:"🐟", title:"Préparer le saumon en papillote", txt:"Préchauffer le four à 180°C. Déposer le pavé sur une feuille d'aluminium. Ajouter rondelles de citron, herbes (thym, aneth), sel, poivre. Fermer la papillote hermétiquement. Enfourner 15-18 min." });
  } else if (hasSaumon) {
    steps.push({ icon:"🐟", title:"Cuire le saumon", txt:"Chauffer une poêle à feu moyen-vif. Déposer le pavé côté peau (si présente) 4 min sans bouger. Retourner, cuire 3 min côté chair. Le saumon doit être nacré au centre. Assaisonner en fin de cuisson." });
  } else if (hasThon && name.includes("tataki")) {
    steps.push({ icon:"🐟", title:"Tataki de thon", txt:"Mélanger sésame + sel. Rouler le thon dedans. Poêle très chaude avec un filet d'huile. Saisir 30 secondes par face — l'intérieur doit rester cru. Trancher et servir immédiatement." });
  } else if (hasThon) {
    steps.push({ icon:"🐟", title:"Cuire le thon", txt:"Poêle bien chaude avec un filet d'huile. Cuire le steak 2-3 min par face selon l'épaisseur. Thon mi-cuit : 1-2 min par face. Assaisonner en fin de cuisson, ajouter un filet de citron." });
  } else if (hasPoulet && !name.includes("cuit")) {
    steps.push({ icon:"🍗", title:"Cuire le poulet", txt:"Poêle antiadhésive à feu moyen. Huile d'olive légère. Saisir l'escalope 5-6 min par face jusqu'à coloration dorée. Vérifier la cuisson au coeur (plus de rose). Pour les cuisses au four : 200°C, 35-40 min." });
  } else if (hasBoeuf) {
    steps.push({ icon:"🥩", title:"Cuire le steak/boeuf haché", txt:"Poêle très chaude (fonte ou inox). Steak haché : 3-4 min par face à feu moyen-vif. Entrecôte : 2 min par face pour saignant, 3 min pour à point. Repos 2 min avant de couper." });
  } else if (hasPorc) {
    steps.push({ icon:"🥩", title:"Cuire le filet de porc", txt:"Four préchauffé à 200°C. Saisir le filet 2 min à la poêle pour colorer. Enfourner 20-25 min. Température à coeur : 65°C. Laisser reposer 5 min avant de trancher." });
  } else if (hasCrevette) {
    steps.push({ icon:"🍤", title:"Poêler les crevettes", txt:"Poêle chaude avec ail émincé et filet d'huile d'olive. Ajouter les crevettes, cuire 2 min par face jusqu'à coloration rose-orangée. Attention : les crevettes durcissent si trop cuites. Presser le citron en fin de cuisson." });
  } else if (isOmelette || hasOeufs) {
    steps.push({ icon:"🍳", title:"Préparer les oeufs", txt:"Battre les oeufs avec sel et poivre. Poêle antiadhésive à feu doux avec un peu de beurre. Pour omelette : verser les oeufs, remuer doucement 2-3 min, plier. Pour brouillés : remuer constamment à feu très doux 3-4 min." });
  }

  // Étape 3 : Légumes
  if (hasLegumes) {
    if (name.includes("four") || name.includes("rôti")) {
      steps.push({ icon:"🥦", title:"Préparer les légumes au four", txt:"Couper les légumes en morceaux réguliers. Disposer sur plaque recouverte de papier cuisson. Arroser d'huile d'olive, sel, herbes de Provence. Four à 200°C, 25-30 min en retournant à mi-cuisson." });
    } else if (name.includes("vapeur")) {
      steps.push({ icon:"🥦", title:"Cuire les légumes vapeur", txt:"Couper les légumes en morceaux. Cuire à la vapeur 10-15 min (brocolis, haricots verts) ou 20 min (carottes). Vérifier la cuisson à la pointe d'un couteau — tendres mais encore fermes." });
    } else {
      steps.push({ icon:"🥦", title:"Préparer les légumes", txt:"Couper les légumes. Poêle avec filet d'huile d'olive à feu moyen. Saisir 5-7 min en remuant. Ajouter ail haché si nécessaire en fin de cuisson (ne pas brûler). Assaisonner." });
    }
  }

  // Étape 4 : Assemblage / dressage
  if (isBowl) {
    steps.push({ icon:"🥣", title:"Assembler le bowl", txt:"Disposer les féculents dans le fond du bol. Ajouter la protéine par-dessus. Garnir avec les légumes, les crudités. Assaisonner avec la vinaigrette juste avant de servir pour éviter que la salade ramollisse." });
  } else if (isTartine) {
    steps.push({ icon:"🍞", title:"Préparer les tartines", txt:"Toaster légèrement le pain si souhaité. Tartiner le fromage blanc. Disposer le jambon ou le saumon. Ajouter les accompagnements (myrtilles, noix, flocons) dans un bol séparé." });
  } else {
    steps.push({ icon:"🍽️", title:"Dresser et servir", txt:"Dresser l'assiette : protéine + féculent + légumes. Assaisonner : sel, poivre, herbes fraîches, filet de citron ou d'huile d'olive. Servir immédiatement. Bon appétit !" });
  }

  return steps;
}

function RecipeModal({ recipe, convives, coeffs, mult, onClose, onLike, onDislike, isLiked }) {
  if (!recipe) return null;
  const factor = Math.max(0.1, totalFactor(convives, coeffs||{}));
  const mu = mult||1;
  const steps = generateSteps(recipe);

  return (
    <div style={{position:"fixed",inset:0,zIndex:400,background:"rgba(0,0,0,.85)",display:"flex",alignItems:"flex-end",justifyContent:"center",padding:0}}
      onClick={onClose}>
      <div onClick={e=>e.stopPropagation()}
        style={{background:"var(--s1)",border:"1px solid var(--s4)",borderRadius:"16px 16px 0 0",width:"100%",maxWidth:600,maxHeight:"90vh",overflowY:"auto",padding:"0 0 32px"}}>

        {/* Header */}
        <div style={{position:"sticky",top:0,background:"var(--s1)",borderBottom:"1px solid var(--s4)",padding:"14px 18px",display:"flex",alignItems:"center",justifyContent:"space-between",zIndex:10}}>
          <div>
            <div style={{fontSize:16,fontWeight:700}}>{recipe.n||recipe.name}</div>
            <div style={{fontSize:11,color:"var(--tm)",marginTop:2}}>{recipe.t} · {factor.toFixed(1)} portion(s) · {Math.round((recipe.kc||0)*mu)} kcal/pers.</div>
          </div>
          <button onClick={onClose} style={{background:"var(--s3)",border:"1px solid var(--s4)",color:"var(--tm)",borderRadius:"50%",width:32,height:32,cursor:"pointer",fontSize:16,flexShrink:0}}>✕</button>
        </div>

        <div style={{padding:"18px 18px 0"}}>

          {/* Macros */}
          <div style={{display:"flex",gap:8,marginBottom:18,flexWrap:"wrap"}}>
            {[[`${Math.round((recipe.kc||0)*mu)} kcal`,"var(--ac)"],[`P ${Math.round((recipe.pr||0)*mu)}g`,"var(--bl)"],[`G ${Math.round((recipe.gl||0)*mu)}g`,"var(--or)"],[`L ${Math.round((recipe.li||0)*mu)}g`,"var(--re)"]].map(([v,c])=>(
              <span key={v} style={{padding:"4px 10px",borderRadius:6,background:`${c}18`,color:c,fontWeight:700,fontSize:13}}>{v}</span>
            ))}
            <span style={{padding:"4px 10px",borderRadius:6,background:"var(--s2)",color:"var(--tm)",fontSize:12}}>Ma portion</span>
          </div>

          {/* Ingrédients */}
          <div style={{marginBottom:20}}>
            <div className="syne" style={{fontSize:12,fontWeight:700,textTransform:"uppercase",letterSpacing:1,color:"var(--tm)",marginBottom:10}}>🛒 Ingrédients — {factor.toFixed(1)} portion(s)</div>
            <div style={{background:"var(--s2)",borderRadius:"var(--rs)",overflow:"hidden"}}>
              {(recipe.ing||[]).map((ing,i)=>{
                const qty = ing.u ? Math.ceil(ing.base * factor * mu) : Math.ceil(ing.base * factor * mu);
                return (
                  <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 14px",borderBottom:i<(recipe.ing.length-1)?"1px solid var(--s3)":"none"}}>
                    <span style={{flex:1,fontSize:13}}>{ing.n}</span>
                    <span style={{fontSize:13,color:"var(--ac)",fontWeight:700,whiteSpace:"nowrap"}}>
                      {qty}{ing.u ? ` ${ing.u}` : ` pièce${qty>1?"s":""}`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Étapes */}
          <div style={{marginBottom:20}}>
            <div className="syne" style={{fontSize:12,fontWeight:700,textTransform:"uppercase",letterSpacing:1,color:"var(--tm)",marginBottom:10}}>👨‍🍳 Préparation</div>
            {steps.map((step,i)=>(
              <div key={i} style={{display:"flex",gap:12,marginBottom:14}}>
                <div style={{width:32,height:32,borderRadius:"50%",background:"var(--acb)",color:"var(--ac)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0,marginTop:2}}>{step.icon}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:700,marginBottom:3,color:"var(--t)"}}>{i+1}. {step.title}</div>
                  <div style={{fontSize:12,color:"var(--tm)",lineHeight:1.6}}>{step.txt}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            <button onClick={onLike}
              style={{flex:1,padding:"10px",borderRadius:"var(--rs)",border:`1px solid ${isLiked?"var(--ac)":"var(--s4)"}`,background:isLiked?"var(--acb)":"transparent",color:isLiked?"var(--ac)":"var(--tm)",cursor:"pointer",fontSize:14,fontWeight:isLiked?700:400}}>
              {isLiked?"❤️ Liké !":"🤍 J'aime"}
            </button>
            <button onClick={onDislike}
              style={{flex:1,padding:"10px",borderRadius:"var(--rs)",border:"1px solid var(--s4)",background:"transparent",color:"var(--tm)",cursor:"pointer",fontSize:14}}>
              👎 Pas fan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Card({ children }) {
  return <div style={{background:"var(--s1)",border:"1px solid var(--s4)",borderRadius:"var(--r)",padding:18,marginBottom:13}}>{children}</div>;
}
function Btn({ children, onClick }) {
  return <button onClick={onClick} style={{background:"var(--ac)",color:"#000",border:"none",padding:"10px 22px",borderRadius:8,cursor:"pointer",fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:13,transition:"all .2s"}}>{children}</button>;
}
function BtnGhost({ children, onClick }) {
  return <button onClick={onClick} style={{background:"transparent",border:"1px solid var(--s4)",color:"var(--tm)",padding:"9px 18px",borderRadius:8,cursor:"pointer",fontSize:13}}>{children}</button>;
}

const inputSty = { background:"var(--s3)",border:"1px solid var(--s4)",color:"var(--t)",borderRadius:6,padding:"5px 8px",fontSize:13 };
const wghSty = { background:"var(--s2)",borderRadius:"var(--rs)",padding:"7px 4px",textAlign:"center",fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:10,textTransform:"uppercase",letterSpacing:1,color:"var(--tm)" };
const cellBtn = { fontSize:11,padding:"2px 5px",borderRadius:4,border:"1px solid var(--s4)",background:"transparent",color:"var(--tm)",cursor:"pointer" };
const cellBtnAc = { fontSize:9,padding:"2px 6px",borderRadius:4,border:"1px solid var(--ac)",background:"var(--acb)",color:"var(--ac)",cursor:"pointer" };
const btnSmSty = { padding:"6px 12px",borderRadius:6,border:"1px solid var(--s4)",background:"transparent",color:"var(--tm)",cursor:"pointer",fontSize:12 };
