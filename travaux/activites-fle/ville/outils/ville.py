"""Aperçu : un quartier de ville française en vue de dessus (jeu de construction de ville FLE).
Bâtiments modelés par script : immeubles haussmanniens, mairie, gare, école, commerces ; rues, fleuve, parc."""
import bpy, bmesh, math, random, sys
from mathutils import Vector
M = "/tmp/claude-0/-home-user-onlineformapro-website/b5e64a29-5f2d-5cad-ac6c-8b8d300e3834/scratchpad/monde/"
sys.path.insert(0, M)
bpy.ops.wm.read_factory_settings(use_empty=True)
import kit
random.seed(3)
SC = bpy.context.scene
MATS = {}


def mat(nom, rgb, rough=.8, metal=0, emit=None):
    if nom in MATS: return MATS[nom]
    m = bpy.data.materials.new(nom); m.use_nodes = True; b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = (*rgb, 1); b.inputs["Roughness"].default_value = rough; b.inputs["Metallic"].default_value = metal
    if emit: b.inputs["Emission Color"].default_value = (*emit, 1); b.inputs["Emission Strength"].default_value = 1.5
    MATS[nom] = m; return m


def boite(x, y, z, sx, sy, sz, m, rz=0, biseau=0.0, nom="b"):
    """boîte de dimensions sx × sy × sz posée en z (base), centrée en (x, y)"""
    bpy.ops.mesh.primitive_cube_add(size=1, location=(x, y, z + sz / 2))
    o = bpy.context.object; o.name = nom; o.scale = (sx, sy, sz); o.rotation_euler.z = math.radians(rz)
    o.data.materials.append(m)
    if biseau:
        bpy.ops.object.transform_apply(scale=True)
        md = o.modifiers.new("bev", "BEVEL"); md.width = biseau; md.segments = 2
    return o


def prisme(x, y, z, w, d, h, retrait, m, rz=0):
    """toit mansardé : tronc de pyramide"""
    bm = bmesh.new()
    b = [bm.verts.new((sx * w / 2, sy * d / 2, 0)) for sx, sy in ((-1, -1), (1, -1), (1, 1), (-1, 1))]
    t = [bm.verts.new((sx * (w / 2 - retrait), sy * (d / 2 - retrait), h)) for sx, sy in ((-1, -1), (1, -1), (1, 1), (-1, 1))]
    for i in range(4): bm.faces.new((b[i], b[(i + 1) % 4], t[(i + 1) % 4], t[i]))
    bm.faces.new(t); bm.faces.new(b[::-1])
    me = bpy.data.meshes.new("toit"); bm.to_mesh(me); bm.free()
    o = bpy.data.objects.new("toit", me); SC.collection.objects.link(o); o.location = (x, y, z); o.rotation_euler.z = math.radians(rz)
    me.materials.append(m); return o


def texte(t, x, y, z, taille, m, rz=0, rx=90):
    bpy.ops.object.text_add(location=(x, y, z)); o = bpy.context.object
    o.data.body = t; o.data.align_x = "CENTER"; o.data.size = taille; o.data.extrude = .03
    o.rotation_euler = (math.radians(rx), 0, math.radians(rz)); o.data.materials.append(m); return o


C = {  # palette
    "pierre": mat("pierre", (.93, .85, .70)), "pierre2": mat("pierre2", (.90, .78, .60)), "ocre": mat("ocre", (.93, .72, .45)), "rose": mat("rose", (.94, .74, .66)), "blancp": mat("blancp", (.95, .93, .88)), "socle": mat("socle", (.70, .64, .54)),
    "zinc": mat("zinc", (.38, .50, .68), .4, .25), "vitre": mat("vitre", (.10, .16, .24), .12, .2), "cadre": mat("cadre", (.95, .94, .90)),
    "fer": mat("fer", (.06, .06, .07), .5, .6), "brique": mat("brique", (.62, .27, .18)), "tuile": mat("tuile", (.72, .33, .20)),
    "asphalte": mat("asphalte", (.15, .16, .19), .9), "trottoir": mat("trottoir", (.82, .78, .70)), "blanc": mat("blanc", (.96, .96, .94)),
    "herbe": mat("herbe", (.33, .62, .16), .95), "eau": mat("eau", (.06, .42, .62), .05), "quai": mat("quai", (.74, .70, .62)),
    "rouge": mat("rouge", (.78, .12, .12)), "bleu": mat("bleufr", (.08, .20, .55)), "vert": mat("vertpharma", (.05, .65, .25), .5, 0, (.05, .9, .3)),
    "or": mat("or", (.85, .66, .25), .3, .8), "jaune": mat("jaune", (.95, .75, .25)), "bois": mat("bois", (.42, .25, .14)),
    "sable": mat("sable", (.86, .78, .58)), "terrain": mat("terrain", (.78, .38, .26)),
}


def fenetres_facade(cx, cy, z0, larg, etages, h_et, normal, pas=2.2, balcons=(2, 5)):
    """fenêtres régulières sur une façade ; normal = (nx, ny) vers l'extérieur ; balcons filants à certains étages"""
    nx, ny = normal; n = max(1, int(larg // pas)); tx, ty = -ny, nx
    for e in range(etages):
        z = z0 + e * h_et + .55
        for i in range(n):
            o = (i - (n - 1) / 2) * pas
            px, py = cx + tx * o + nx * .05, cy + ty * o + ny * .05
            boite(px, py, z - .08, 1.25 if nx == 0 else .12, .12 if nx == 0 else 1.25, 2.05, C["cadre"])
            boite(px + nx * .03, py + ny * .03, z, 1.0 if nx == 0 else .1, .1 if nx == 0 else 1.0, 1.85, C["vitre"])
        if e + 1 in balcons:
            L = n * pas
            boite(cx + nx * .45, cy + ny * .45, z - .12, L if nx == 0 else .9, .9 if nx == 0 else L, .1, C["pierre2"])
            boite(cx + nx * .88, cy + ny * .88, z - .02, L if nx == 0 else .05, .05 if nx == 0 else L, .95, C["fer"])


def immeuble(cx, cy, w, d, etages=5, couleur="pierre", commerce=None, auvent=None, facades=("s", "e", "n", "o")):
    """immeuble haussmannien : rez-de-chaussée commerçant, étages de pierre, corniches, toit mansardé en zinc, cheminées"""
    h_rdc, h_et = 4.2, 3.0
    boite(cx, cy, 0, w, d, h_rdc, C["socle"])
    boite(cx, cy, h_rdc, w, d, etages * h_et, C[couleur])
    for e in range(etages + 1):
        boite(cx, cy, h_rdc + e * h_et - .12, w + .3, d + .3, .18 if e in (0, 2, etages) else .1, C["pierre2"])
    ztop = h_rdc + etages * h_et
    boite(cx, cy, ztop, w + .6, d + .6, .35, C["pierre2"])
    prisme(cx, cy, ztop + .35, w + .2, d + .2, 3.2, 1.3, C["zinc"])
    for k in range(max(2, int(w // 4))):
        boite(cx - w / 2 + 2 + k * (w - 4) / max(1, int(w // 4) - 1), cy + d / 2 - .9, ztop + 1.4, .8, .5, 1.1, C["zinc"])
        boite(cx - w / 2 + 2 + k * (w - 4) / max(1, int(w // 4) - 1), cy - d / 2 + .9, ztop + 1.4, .8, .5, 1.1, C["zinc"])
    for k in range(2):
        boite(cx - w / 4 + k * w / 2, cy, ztop + 3.0, 1.0, 2.2, 1.6, C["brique"])
        for j in range(3): boite(cx - w / 4 + k * w / 2, cy - .7 + j * .7, ztop + 4.6, .28, .28, .4, C["terrain"])
    dico = {"s": ((cx, cy - d / 2), (0, -1), w), "n": ((cx, cy + d / 2), (0, 1), w), "e": ((cx + w / 2, cy), (1, 0), d), "o": ((cx - w / 2, cy), (-1, 0), d)}
    for f in facades:
        (fx, fy), nrm, L = dico[f]
        fenetres_facade(fx, fy, h_rdc, L, etages, h_et, nrm)
        # vitrines du rez-de-chaussée
        nx, ny = nrm; n = max(1, int(L // 3.2))
        for i in range(n):
            o = (i - (n - 1) / 2) * 3.2
            boite(fx - ny * o + nx * .06, fy + nx * o + ny * .06, .3, 2.4 if nx == 0 else .1, .1 if nx == 0 else 2.4, 3.0, C["vitre"])
    if commerce:
        (fx, fy), (nx, ny), L = dico["s"]
        boite(fx, fy - .25, 3.35, L * .8, .3, .7, C["bois"] if commerce != "PHARMACIE" else C["blanc"])
        texte(commerce, fx, fy - .42, 3.47, .52, C["or"] if commerce != "PHARMACIE" else C["vert"])
        if commerce == "PHARMACIE":
            for (a, b) in ((.35, 1.1), (1.1, .35)): boite(fx + L / 2 - 1.2, fy - 1.0, 5.0 - b / 2 + .2, a, .2, b, C["vert"])
    if auvent:
        (fx, fy), _, L = dico["s"]
        for k in range(int(L * 1.2)):
            o = -L * .45 + k * (L * .9) / int(L * 1.2)
            s = boite(fx + o, fy - 1.0, 3.0, (L * .9) / int(L * 1.2) + .01, 2.0, .08, C[auvent] if k % 2 == 0 else C["blanc"])
            s.rotation_euler.x = math.radians(-18)


def mairie(cx, cy):
    w, d = 22, 13
    boite(cx, cy, 0, w, d, 4.6, C["socle"]); boite(cx, cy, 4.6, w, d, 6.5, C["pierre"])
    boite(cx, cy, 11.1, w + .6, d + .6, .5, C["pierre2"])
    prisme(cx, cy, 11.6, w, d, 3.6, 1.8, C["zinc"])
    boite(cx, cy - d / 2 - .8, 0, 8, 2.6, 13.5, C["pierre"])               # pavillon central
    fr = prisme(cx, cy - d / 2 - .8, 13.5, 8.4, 2.8, 2.6, 1.2, C["pierre2"])
    boite(cx, cy - d / 2 - 2.15, 9.0, 2.2, .2, 2.2, C["blanc"]); boite(cx, cy - d / 2 - 2.27, 9.85, .1, .05, .9, C["fer"])  # horloge
    texte("MAIRIE", cx, cy - d / 2 - 2.15, 7.2, 1.05, C["or"])
    for k in range(3): boite(cx, cy - d / 2 - 2.6 - k * .7, 0, 9 + k * 1.2, .7, .5 - k * .15, C["pierre2"])   # marches
    fenetres_facade(cx - 7.3, cy - d / 2, 4.6, 7, 2, 3.0, (0, -1), balcons=()); fenetres_facade(cx + 7.3, cy - d / 2, 4.6, 7, 2, 3.0, (0, -1), balcons=())
    fenetres_facade(cx + w / 2, cy, 4.6, d, 2, 3.0, (1, 0), balcons=())
    for k, c in enumerate(["bleu", "blanc", "rouge"]):                     # drapeau
        boite(cx - 1.6 + .55 + k * 1.0, cy - d / 2 - 2.4, 15.2, 1.0, .06, 1.4, C[c])
    boite(cx - 1.6, cy - d / 2 - 2.4, 13.5, .1, .1, 3.2, C["fer"])


def gare(cx, cy):
    w, d = 30, 12
    boite(cx, cy, 0, w, d, 9, C["pierre2"]); boite(cx, cy, 9, w + .5, d + .5, .5, C["pierre"])
    prisme(cx, cy, 9.5, w, d, 2.5, 2, C["zinc"])
    for k in range(5):
        x = cx - 12 + k * 6
        boite(x, cy - d / 2 + .02, 1, 4.2, .2, 6.5, C["cadre"]); boite(x, cy - d / 2 - .02, 1.2, 3.8, .2, 6.1, C["vitre"])
    boite(cx + w / 2 - 3, cy - 2, 0, 5, 5, 19, C["pierre"]); prisme(cx + w / 2 - 3, cy - 2, 19, 5.4, 5.4, 3, 2.2, C["zinc"])
    boite(cx + w / 2 - 3, cy - 4.6, 15, 2.6, .2, 2.6, C["blanc"])
    texte("GARE", cx - 4, cy - d / 2 - .15, 7.6, 1.2, C["or"])
    for k in range(3):                                                     # voies
        boite(cx, cy + d / 2 + 4 + k * 4, .02, w + 30, 2.6, .1, C["sable"])
        for r in (-.75, .75): boite(cx, cy + d / 2 + 4 + k * 4 + r, .12, w + 30, .12, .12, C["fer"])
    boite(cx, cy + d / 2 + 8, 5, w + 6, 14, .3, C["vitre"])                # marquise


def ecole(cx, cy):
    boite(cx - 4, cy + 3, 0, 18, 8, 7.5, mat("ecole", (.95, .86, .62))); prisme(cx - 4, cy + 3, 7.5, 18.4, 8.4, 2.6, 2.8, C["tuile"])
    fenetres_facade(cx - 4, cy - 1, .3, 18, 2, 3.4, (0, -1), pas=2.6, balcons=())
    boite(cx - 4, cy - 1.15, 2.4, 6, .3, 1.0, C["bleu"]); texte("ÉCOLE", cx - 4, cy - 1.32, 2.6, .7, C["blanc"])
    boite(cx + 2, cy - 7, .02, 12, 8, .06, C["terrain"])                    # cour
    for k in range(4): boite(cx - 3 + k * 3.4, cy - 7, .09, .12, 7, .02, C["blanc"])


def maison(cx, cy, rz=0, couleur=(.93, .85, .72)):
    m = mat("maison%.2f" % couleur[0], couleur)
    boite(cx, cy, 0, 8, 7, 5.6, m, rz); t = prisme(cx, cy, 5.6, 8.6, 7.6, 2.6, 2.6, C["tuile"], rz)
    for s in (-1, 1): boite(cx + s * 2, cy - 3.55, 1.2, 1.2, .15, 1.6, C["vitre"], rz)
    boite(cx, cy - 3.55, 0, 1.1, .15, 2.2, C["bois"], rz)


def voiture(x, y, rz, couleur):
    m = mat("voit%.2f" % couleur[0] + "%.2f" % couleur[1], couleur, .35, .4)
    c = boite(x, y, .35, 4.2, 1.8, .75, m, rz, biseau=.18); h = boite(x - .2 * math.cos(math.radians(rz)), y - .2 * math.sin(math.radians(rz)), 1.05, 2.2, 1.6, .65, C["vitre"], rz, biseau=.15)
    for sx in (-1.3, 1.3):
        for sy in (-.85, .85):
            r = math.radians(rz); px = x + sx * math.cos(r) - sy * math.sin(r); py = y + sx * math.sin(r) + sy * math.cos(r)
            bpy.ops.mesh.primitive_cylinder_add(radius=.36, depth=.3, location=(px, py, .36), rotation=(math.radians(90), 0, r)); bpy.context.object.data.materials.append(C["fer"])


FEUILLES = [mat("f1", (.18, .48, .10)), mat("f2", (.28, .58, .14)), mat("f3", (.40, .64, .16))]
TRONC = mat("tronc", (.40, .26, .16))


def arbre(x, y, s=1.0, z=0):
    bpy.ops.mesh.primitive_cylinder_add(radius=.22 * s, depth=2.2 * s, location=(x, y, z + 1.1 * s)); bpy.context.object.data.materials.append(TRONC)
    for k in range(3):
        r = (1.5 - .25 * k) * s
        bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2, radius=r, location=(x + random.uniform(-.5, .5) * s, y + random.uniform(-.5, .5) * s, z + (2.6 + 1.0 * k) * s))
        o = bpy.context.object; o.data.materials.append(random.choice(FEUILLES))
        for v in o.data.vertices: v.co *= random.uniform(.88, 1.1)
        o.data.polygons.foreach_set("use_smooth", [True] * len(o.data.polygons))


PEAUX = [(.95, .78, .62), (.78, .55, .38), (.45, .30, .20), (.98, .85, .72)]
HABITS = [(.85, .2, .15), (.15, .35, .75), (.95, .75, .1), (.2, .6, .35), (.95, .95, .95), (.25, .25, .3), (.7, .3, .6)]


def passant(x, y):
    m = mat("hab%.2f%.2f" % HABITS[k % 7][:2] if (k := random.randrange(7)) is not None else "", HABITS[k])
    bpy.ops.mesh.primitive_cylinder_add(radius=.28, depth=1.1, location=(x, y, .16 + .55)); bpy.context.object.data.materials.append(m)
    pe = random.choice(PEAUX); mp = mat("peau%.2f" % pe[0], pe)
    bpy.ops.mesh.primitive_uv_sphere_add(radius=.24, location=(x, y, .16 + 1.35)); bpy.context.object.data.materials.append(mp)


def parasol(x, y, couleur):
    bpy.ops.mesh.primitive_cone_add(radius1=1.4, depth=.6, location=(x, y, 2.4)); bpy.context.object.data.materials.append(couleur)
    bpy.ops.mesh.primitive_cylinder_add(radius=.05, depth=2.2, location=(x, y, 1.2)); bpy.context.object.data.materials.append(C["fer"])
    bpy.ops.mesh.primitive_cylinder_add(radius=.5, depth=.06, location=(x, y, .9)); bpy.context.object.data.materials.append(C["blanc"])


# ---------------------------------------------------------------- sol, rues, fleuve
boite(0, 0, -.2, 260, 260, .2, C["herbe"])
B, R = 28, 10                       # îlots de 28 m, rues de 10 m
centres = [-38, 0, 38]
for x in (-57, -19, 19, 57):
    boite(x, 0, 0, R, 150, .05, C["asphalte"])
    for k in range(-14, 15): boite(x, k * 5, .05, .18, 2.2, .02, C["blanc"])
for y in (-57, -19, 19, 57):
    boite(0, y, 0, 150, R, .052, C["asphalte"])
    for k in range(-14, 15): boite(k * 5, y, .055, 2.2, .18, .02, C["blanc"])
for cx in centres:
    for cy in centres:
        boite(cx, cy, 0, B, B, .16, C["trottoir"])
for x in (-19, 19):                 # passages piétons
    for y in (-19, 19):
        for k in range(6): boite(x - 3.5 + k * 1.4, y - 6.4, .06, .7, 2.6, .02, C["blanc"])
boite(0, 84, -.6, 260, 34, .62, C["eau"])                              # le fleuve, au nord
for s in (-1, 1): boite(0, 84 + s * 17.5, -1, 260, 2.5, 1.2, C["quai"])
boite(19, 84, .6, 12, 38, .8, C["quai"]); boite(19, 84, 1.4, 10, 38, .06, C["asphalte"])   # pont
for k in range(4): boite(19, 70 + k * 9.5, -.6, 2.2, 3, 1.2, C["quai"])

# ---------------------------------------------------------------- îlots
mairie(0, 2)
FLEURS = [mat("fl1", (.9, .15, .2)), mat("fl2", (.98, .8, .1)), mat("fl3", (.85, .3, .7))]
for k in range(3):
    boite(-6 + k * 6, -8.5, .16, 4.5, 3, .25, C["herbe"])
    for j in range(14): bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1, radius=.32, location=(-6 + k * 6 + random.uniform(-1.9, 1.9), -8.5 + random.uniform(-1.2, 1.2), .5)); bpy.context.object.data.materials.append(FLEURS[(j + k) % 3])
immeuble(-45, -1, 13, 12, 5, commerce="BOULANGERIE", auvent="rouge")
immeuble(-31, -1, 13, 12, 6, "pierre2", commerce="PHARMACIE")
immeuble(-38, 11, 26, 4.8, 5, "ocre", facades=("n", "e", "o"))
ecole(38, 2)
immeuble(-45, 37, 13, 12, 6, "rose", commerce="CAFÉ", auvent="bleu"); immeuble(-31, 37, 13, 12, 5, "blancp")
immeuble(-38, 49, 26, 4.8, 6, "ocre", facades=("n", "e", "o"))
immeuble(-7, 37, 13, 12, 5, "blancp", commerce="POSTE", auvent="jaune"); immeuble(7, 37, 13, 12, 6, "ocre", commerce="BANQUE")
gare(38, 30)
# parc au sud
boite(0, -38, .16, 26, 26, .1, C["herbe"])
for (a, b) in ((26, 2.4), (2.4, 26)): boite(0, -38, .27, a, b, .03, C["sable"])
bpy.ops.mesh.primitive_cylinder_add(radius=3.2, depth=.7, location=(0, -38, .5)); bpy.context.object.data.materials.append(C["quai"])
bpy.ops.mesh.primitive_cylinder_add(radius=2.7, depth=.2, location=(0, -38, .82)); bpy.context.object.data.materials.append(C["eau"])
for (x, y) in [(-8, -30), (8, -30), (-8, -46), (8, -46), (-10, -38), (10, -38), (0, -48.5), (-4, -27)]:
    arbre(x, y, random.uniform(1.0, 1.3), .2)
# maisons et marché
for (x, y) in [(-45, -45), (-31, -45), (-45, -31), (-31, -31)]: maison(x, y, 0, random.choice([(.93, .85, .72), (.95, .9, .82), (.9, .78, .66)]))
boite(38, -38, 0, 24, 16, 6, mat("halle", (.55, .32, .2))); prisme(38, -38, 6, 25, 17, 4, 4, C["vitre"])
texte("MARCHÉ", 38, -46.15, 4.2, 1.2, C["or"])
# arbres d'alignement et voitures
for x in range(-70, 75, 9):
    for y in (-52.5, 13.5 + 10.5, -13.5 - 10.5):
        if abs(x - 19) > 7 and abs(x + 19) > 7 and abs(x - 57) > 7 and abs(x + 57) > 7:
            arbre(x, y, .8, .16)
COUL = [(.85, .15, .12), (.95, .95, .95), (.15, .3, .7), (.95, .7, .1), (.2, .2, .22), (.3, .6, .35)]
for k in range(16):
    if k % 2: voiture(random.choice([-57, -19, 19, 57]) + random.choice([-2.2, 2.2]), random.uniform(-70, 60), 90, random.choice(COUL))
    else: voiture(random.uniform(-70, 70), random.choice([-57, -19, 19]) + random.choice([-2.2, 2.2]), 0, random.choice(COUL))

for k in range(3): parasol(-49 + k * 4, -9.4 + 46 - 8, C["rouge"] if k % 2 else C["blanc"])
# îlot de l'école : pelouses et arbres autour de la cour
for (x, y, a, b) in [(45, -8, 9, 7), (30, 11, 10, 5), (46, 11, 7, 5)]: boite(x, y, .16, a, b, .1, C["herbe"])
for (x, y) in [(46, -10), (44, -6), (29, 11), (33, 12), (47, 12)]: arbre(x, y, .9, .2)
# parvis de la gare : taxis, arrêt de bus, arbres
for k in range(3): voiture(30 + k * 5.5, 20.5, 0, (.98, .8, .15))
boite(46, 20.5, .16, 6, 1.6, .1, C["herbe"]); arbre(44, 20.6, .8, .2); arbre(48, 20.6, .8, .2)
# marché : étals colorés autour de la halle
for k in range(6):
    x = 28 + k * 4; parasol(x, -27.5, [C["rouge"], C["jaune"], C["bleu"], C["blanc"]][k % 4])
    boite(x, -27.5, .16, 2.2, 1.2, .9, C["bois"])
    for j in range(5): bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1, radius=.18, location=(x - .8 + j * .4, -27.5, 1.15)); bpy.context.object.data.materials.append(FLEURS[j % 3] if j % 2 else mat("leg", (.4, .7, .2)))
for k in range(70):
    cx, cy = random.choice(centres), random.choice(centres)
    cote = random.choice(["s", "n", "e", "o"]); t = random.uniform(-12, 12)
    x, y = {"s": (cx + t, cy - 13), "n": (cx + t, cy + 13), "e": (cx + 13, cy + t), "o": (cx - 13, cy + t)}[cote]
    passant(x, y)
for k in range(10): passant(random.uniform(-6, 6), random.uniform(-12, -9))
bus = boite(-19 - 2.3, -30, .4, 2.5, 11, 2.6, mat("bus", (.12, .55, .30), .4, .2), 0, biseau=.3)
boite(-19 - 2.3, -30, 1.7, 2.55, 10, .9, C["vitre"])
# ---------------------------------------------------------------- lumière, caméra isométrique, rendu
bpy.ops.object.light_add(type="SUN", rotation=(math.radians(48), math.radians(8), math.radians(-35)))
sun = bpy.context.object.data; sun.energy = 5.2; sun.angle = math.radians(2.5); sun.color = (1, .92, .80)
w = bpy.data.worlds.new("ciel"); SC.world = w; w.use_nodes = True
bg = w.node_tree.nodes["Background"]; bg.inputs[0].default_value = (.50, .68, .95, 1); bg.inputs[1].default_value = .62
cd = bpy.data.cameras.new("iso"); cd.type = "ORTHO"; cd.ortho_scale = 108
cam = bpy.data.objects.new("iso", cd); SC.collection.objects.link(cam)
cam.rotation_euler = (math.radians(58), 0, math.radians(40))
d = Vector((0, 0, 1)); d.rotate(cam.rotation_euler); cam.location = Vector((0, 14, 0)) + d * 160
SC.camera = cam
SC.render.engine = "CYCLES"; SC.cycles.samples = 24; SC.cycles.use_denoising = True
SC.render.resolution_x, SC.render.resolution_y = 1600, 1000
SC.view_settings.view_transform = "AgX"
for look in ("AgX - Punchy", "Punchy", "AgX - Medium High Contrast"):
    try: SC.view_settings.look = look; print("LOOK", look); break
    except Exception: pass
SC.render.filepath = M + "glb/ville_apercu.png"
bpy.ops.render.render(write_still=True)
print("RENDU OK")
