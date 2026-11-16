"""Construit la place du village (extérieur) et l'intérieur de la boulangerie, avec leurs plans JSON.
usage : python village.py exterieur|interieur [rendu]"""
import bpy, sys, math, random, json, bmesh
sys.path.insert(0, "/tmp/claude-0/-home-user-onlineformapro-website/b5e64a29-5f2d-5cad-ac6c-8b8d300e3834/scratchpad/monde")
args = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else sys.argv[1:]
QUOI = args[0]; RENDU = "rendu" in args
bpy.ops.wm.read_factory_settings(use_empty=True)
import kit
from kit import poser, maison
SORTIE = "/tmp/claude-0/-home-user-onlineformapro-website/b5e64a29-5f2d-5cad-ac6c-8b8d300e3834/scratchpad/monde/glb/"
random.seed(7)
plan = {"obstacles": [], "portes": {}, "habitants": {}, "cercles": []}


def t3(x, y, z=0):
    """coordonnées Blender (z en haut) -> Three.js (y en haut)"""
    return [round(x, 3), round(z, 3), round(-y, 3)]


def obstacle_rect(x0, y0, x1, y1):
    a, b = t3(x0, y0), t3(x1, y1)
    plan["obstacles"].append([min(a[0], b[0]), min(a[2], b[2]), max(a[0], b[0]), max(a[2], b[2])])


def obstacle_cercle(x, y, r):
    p = t3(x, y); plan["cercles"].append([p[0], p[2], r])


def renommer(objs, prefixe):
    for o in objs: o.name = prefixe + "_" + o.name


def mat_couleur(nom, rgb, rough=.9):
    m = bpy.data.materials.new(nom); m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]; b.inputs["Base Color"].default_value = (*rgb, 1); b.inputs["Roughness"].default_value = rough
    return m


# ---------------------------------------------------------------- pains (maillages faits main, couleurs aux sommets)
def croute(bm, bas=(.78, .52, .25), haut=(.55, .30, .10), entaille=None):
    col = bm.loops.layers.color.new("Col")
    zs = [v.co.z for v in bm.verts]; z0, z1 = min(zs), max(zs)
    for f in bm.faces:
        for l in f.loops:
            t = (l.vert.co.z - z0) / max(1e-6, z1 - z0)
            c = [bas[i] * (1 - t) + haut[i] * t for i in range(3)]
            if entaille and entaille(l.vert.co): c = [min(1, x * 1.45 + .08) for x in c]
            l[col] = (*c, 1)


def objet_bm(nom, bm, mat):
    me = bpy.data.meshes.new(nom); bm.to_mesh(me); bm.free()
    for p in me.polygons: p.use_smooth = True
    o = bpy.data.objects.new(nom, me); me.materials.append(mat); bpy.context.scene.collection.objects.link(o)
    return o


def mat_pain():
    m = bpy.data.materials.get("Pain")
    if m: return m
    m = bpy.data.materials.new("Pain"); m.use_nodes = True; nt = m.node_tree
    b = nt.nodes["Principled BSDF"]; b.inputs["Roughness"].default_value = .75
    a = nt.nodes.new("ShaderNodeVertexColor"); a.layer_name = "Col"; nt.links.new(a.outputs["Color"], b.inputs["Base Color"])
    return m


def baguette(x, y, z, rz=0, ry=0, L=.62):
    bm = bmesh.new(); bmesh.ops.create_uvsphere(bm, u_segments=16, v_segments=10, radius=1)
    for v in bm.verts: v.co.x *= L / 2; v.co.y *= .035; v.co.z *= .03
    croute(bm, entaille=lambda c: c.z > .018 and abs(((c.x + L / 2) / (L / 6)) % 1 - .5) < .12)
    o = objet_bm("Baguette", bm, mat_pain()); o.location = (x, y, z); o.rotation_euler = (0, ry, rz); return o


def boule(x, y, z, r=.11):
    bm = bmesh.new(); bmesh.ops.create_uvsphere(bm, u_segments=18, v_segments=10, radius=r)
    for v in bm.verts:
        v.co.z *= .62
        if v.co.z < 0: v.co.z *= .35
    croute(bm, entaille=lambda c: c.z > r * .3 and (abs(c.x) < r * .09 or abs(c.y) < r * .09))
    o = objet_bm("Pain", bm, mat_pain()); o.location = (x, y, z); return o


def croissant(x, y, z, rz=0):
    bm = bmesh.new(); anneaux = []; N = 14; M = 10
    for i in range(N + 1):
        t = i / N; ang = math.radians(-70 + 140 * t)
        rr = .028 + .03 * math.sin(math.pi * t) ** .8
        cx, cy = .09 * math.sin(ang), -.09 * math.cos(ang) + .06
        anneau = []
        for j in range(M):
            a = 2 * math.pi * j / M
            px = cx + math.sin(ang) * rr * math.cos(a); py = cy - math.cos(ang) * rr * math.cos(a); pz = rr * math.sin(a) * .8
            anneau.append(bm.verts.new((px, py, max(pz, -rr * .25))))
        anneaux.append(anneau)
    for i in range(N):
        for j in range(M):
            bm.faces.new((anneaux[i][j], anneaux[i][(j + 1) % M], anneaux[i + 1][(j + 1) % M], anneaux[i + 1][j]))
    bmesh.ops.contextual_create(bm, geom=anneaux[0]); bmesh.ops.contextual_create(bm, geom=anneaux[-1])
    croute(bm, bas=(.85, .6, .3), haut=(.62, .36, .12), entaille=lambda c: abs(math.atan2(c.y - .06, c.x) * 7 % 1 - .5) < .08)
    o = objet_bm("Croissant", bm, mat_pain()); o.location = (x, y, z); o.rotation_euler = (0, 0, rz); return o


# ---------------------------------------------------------------- extérieur
if QUOI == "exterieur":
    # sol : prairie et place pavée
    bpy.ops.mesh.primitive_plane_add(size=140, location=(0, 0, 0)); sol = bpy.context.object; sol.name = "Sol_Herbe"
    sol.data.materials.append(mat_couleur("Herbe", (.32, .55, .18)))
    for i in range(-6, 6):
        for j in range(-4, 5):
            if abs(i + .5) > 5 and abs(j) > 3: continue          # coins arrondis
            renommer(poser("Floor_UnevenBrick", 1 + 2 * i, 2 * j, .015), "Place")
    # chemin vers l'étang et la sortie du village (au sud)
    for k in range(9):
        renommer(poser("RockPath_Square_Wide" if k % 2 else "RockPath_Round_Wide", 1.2 * math.sin(k * .5), -10.5 - 2.1 * k, .01, random.uniform(0, 360)), "Chemin")

    # rangée nord : maison, boulangerie, pharmacie (façades vers la place, au sud)
    renommer(maison(-16, 13.5, 6, 8, etages=2, porte=1, toit="Roof_RoundTiles_6x8", toit_rot=0), "Maison1")
    obstacle_rect(-19, 9.5, -13, 17.5)
    b = maison(-4, 13, 8, 6, etages=2, porte=1, fenetres_rdc=[0, 2, 3], toit="Roof_RoundTiles_6x8", toit_rot=90)
    renommer(b, "Boulangerie"); obstacle_rect(-8, 10, 0, 16)
    plan["portes"]["boulangerie"] = {"pos": t3(-5, 10), "devant": t3(-5, 8.9), "nom": "la boulangerie", "ouverte": True,
                                     "enseigne": t3(-1.6, 9.75, 2.6)}
    ph = maison(6, 13, 6, 6, etages=2, porte=1, fenetres_rdc=[0, 2], toit="Roof_RoundTiles_6x6", toit_rot=90, pierre=False, haut="Straight")
    renommer(ph, "Pharmacie"); obstacle_rect(3, 10, 9, 16)
    plan["portes"]["pharmacie"] = {"pos": t3(6, 10), "devant": t3(6, 8.9), "nom": "la pharmacie", "ouverte": False,
                                   "enseigne": t3(8.1, 9.75, 2.6)}
    renommer(maison(15, 14.5, 6, 8, etages=3, porte=1, toit="Roof_RoundTiles_6x8", toit_rot=0, pierre=False), "Maison2")
    obstacle_rect(12, 10.5, 18, 18.5)
    # côtés ouest et est
    renommer(maison(-18, -1, 6, 8, etages=2, porte=1, facade="droite", toit="Roof_RoundTiles_6x8", toit_rot=0), "Maison3")
    obstacle_rect(-21, -5, -15, 3)
    plan["portes"]["maison3"] = {"pos": t3(-15, -2), "devant": t3(-13.9, -2), "nom": "la maison", "ouverte": False}
    renommer(maison(18, -1, 6, 8, etages=2, porte=2, facade="gauche", toit="Roof_RoundTiles_6x8", toit_rot=0, haut="WoodGrid"), "Maison4")
    obstacle_rect(15, -5, 21, 3)

    # mobilier de la place
    def prop(nom, x, y, rz=0, r=.6, s=1, z=0):
        o = poser(nom, x, y, z, rz, s); renommer(o, "Deco"); obstacle_cercle(x, y, r); return o
    prop("Stall_Empty", 9, 3, -100, 1.6)
    for k, n in enumerate(["FarmCrate_Apple", "FarmCrate_Carrot", "FarmCrate_Apple"]):
        prop(n, 7.6 + .7 * k, 1.4, random.uniform(-10, 10), .45)
    prop("Prop_Wagon", -10, -6, 25, 1.6)
    prop("Barrel", -8.6, 9.3, 0, .45); prop("Barrel_Apples", -9.4, 8.7, 30, .45)
    prop("Crate_Wooden", 1.2, 9.2, 15, .5); prop("Bag", .4, 9.4, 0, .35)
    prop("Bench", 13, -9.5, 180, .9); prop("Bench", -4, -9.6, 180, .9)
    prop("Barrel", 3.2, 9.3, 0, .45)
    prop("Lantern_Wall", -2.2, 9.9, 0, .1, z=1.5); prop("Lantern_Wall", 4.4, 9.9, 0, .1, z=1.5)
    for x in (-12.6, -12.6, 12.6):
        pass
    # clôture du pré
    for k in range(6):
        prop("Prop_WoodenFence_Single", -22 + 2 * k, -14, 0, .3)

    # étang (l'eau est dessinée par le jeu) : bord de rochers et galets
    EX, EY, ER = 9, -19, 4.6
    plan["etang"] = {"centre": t3(EX, EY), "rayon": ER}
    obstacle_cercle(EX, EY, ER + .3)
    for k in range(26):
        a = 2 * math.pi * k / 26 + random.uniform(-.08, .08); r = ER + random.uniform(-.1, .4)
        n = random.choice(["Pebble_Round_1", "Pebble_Round_2", "Pebble_Round_3", "Pebble_Square_2", "Pebble_Round_4"])
        renommer(poser(n, EX + r * math.cos(a), EY + r * math.sin(a), 0, random.uniform(0, 360), random.uniform(.7, 1.2)), "Berge")
    for k in range(4):
        a = random.uniform(0, 2 * math.pi)
        renommer(poser(random.choice(["Rock_Medium_1", "Rock_Medium_2", "Rock_Medium_3"]), EX + (ER + .6) * math.cos(a), EY + (ER + .6) * math.sin(a), 0, random.uniform(0, 360), .8), "Berge")
    for k in range(10):
        a = random.uniform(0, 2 * math.pi); r = ER + random.uniform(.6, 1.6)
        renommer(poser(random.choice(["Plant_1", "Fern_1", "Grass_Wispy_Tall", "Flower_3_Group"]), EX + r * math.cos(a), EY + r * math.sin(a), 0, random.uniform(0, 360)), "Berge")

    # nature : arbres en couronne, buissons au pied des murs, herbes et fleurs dans le pré
    def libre(x, y, marge=1.5):
        if -13 < x < 13 and -9.5 < y < 9.5: return False
        for (ax, az, bx, bz) in plan["obstacles"]:
            if ax - marge < x < bx + marge and az - marge < -y < bz + marge: return False
        for (cx, cz, r) in plan["cercles"]:
            if (x - cx) ** 2 + (-y - cz) ** 2 < (r + marge) ** 2: return False
        if abs(x - 1.2 * math.sin((-y - 10.5) / 2.1 * .5)) < 1.6 and y < -9: return False   # chemin
        return True
    arbres = 0
    while arbres < 46:
        a = random.uniform(0, 2 * math.pi); r = random.uniform(24, 46)
        x, y = r * math.cos(a), r * math.sin(a) * .9
        if not libre(x, y, 2.5): continue
        n = random.choice(["CommonTree_1", "CommonTree_2", "CommonTree_3", "CommonTree_4", "CommonTree_5", "Pine_1", "Pine_2", "CommonTree_3"])
        renommer(poser(n, x, y, 0, random.uniform(0, 360), random.uniform(.85, 1.25)), "Arbre"); obstacle_cercle(x, y, .7); arbres += 1
    for (x, y) in [(-11, 5.5), (12.2, -6.4), (-12, -9), (13.5, 7.5), (-20.5, 9), (21, 8)]:
        renommer(poser(random.choice(["CommonTree_2", "CommonTree_4"]), x, y, 0, random.uniform(0, 360), .9), "Arbre"); obstacle_cercle(x, y, .7)
    # buissons au pied des façades
    for (x, y) in [(-9, 10.4), (.9, 10.5), (2.4, 10.4), (9.8, 10.4), (-13.6, -5.6), (-13.6, 3.6), (14.4, -5.6), (14.4, 3.6), (11.4, 10.6), (-12.2, 9.6)]:
        renommer(poser(random.choice(["Bush_Common", "Bush_Common_Flowers"]), x, y, 0, random.uniform(0, 360), random.uniform(.8, 1.1)), "Buisson"); obstacle_cercle(x, y, .6)
    n = 0
    while n < 900:
        x, y = random.uniform(-40, 40), random.uniform(-40, 40)
        if not libre(x, y, .4): continue
        nom = random.choices(["Grass_Common_Short", "Grass_Common_Tall", "Grass_Wispy_Short", "Flower_3_Group", "Flower_4_Group", "Clover_1", "Clover_2", "Mushroom_Common"],
                             [30, 18, 14, 6, 6, 8, 8, 1])[0]
        renommer(poser(nom, x, y, 0, random.uniform(0, 360), random.uniform(.4, .7) if "Grass" in nom else random.uniform(.5, .8)), "Herbe"); n += 1

    plan["habitants"]["passant"] = {"pos": t3(1.5, -2.5), "chemin": [t3(1.5, -2.5), t3(-6, 2), t3(-1, 6), t3(6, -1)]}
    plan["depart"] = t3(0, -14)
    plan["camera"] = {"decalage": [0, 7.2, 11.5]}

# ---------------------------------------------------------------- intérieur de la boulangerie
if QUOI == "interieur":
    o = maison(0, 0, 8, 6, etages=1, porte=1, fenetres_rdc=[0, 2, 3], toit=None, rdc_sol="Floor_WoodLight", volets=False)
    for ob in o:
        # le mur de façade (au sud, y = -3) s'efface quand on est dedans : on le marque
        ob.name = ("MurAvant_" if abs(ob.matrix_world.translation.y + 3) < .4 else "Piece_") + ob.name
    # le plancher du dessus fait plafond : on l'enlève (vue en coupe)
    for ob in list(bpy.context.scene.collection.objects):
        if ob.name.startswith("Piece_Floor_WoodDark") and ob.matrix_world.translation.z > 2: bpy.data.objects.remove(ob)
    plan["porte"] = {"pos": t3(-1, -3), "dedans": t3(-1, -1.9)}
    # comptoir : deux grandes tables en long, la boulangère derrière
    def prop(nom, x, y, rz=0, z=0, s=1, r=None):
        ob = poser(nom, x, y, z, rz, s); renommer(ob, "Deco")
        if r: obstacle_cercle(x, y, r)
        return ob
    prop("Table_Large", .3, .55, 0)
    obstacle_rect(-1.2, 0, 1.8, 1.1)
    for sx in (-1.6, 1.6):
        for zz in (.7, 1.25, 1.8): prop("Shelf_Simple", sx, 2.69, 0, z=zz)
    obstacle_rect(-3.8, 2.2, 3.8, 3)
    prop("Barrel", 3.3, 2.1, 0, r=.45); prop("Bag", -3.3, 2.2, 20, r=.4); prop("Bag", -3.4, 1.4, -30, r=.4)
    prop("Crate_Wooden", 3.3, -2.3, 10, r=.5); prop("FarmCrate_Empty", -3.3, -2.3, 0, r=.5)
    prop("CandleStick", 1.5, .45, 0, z=.81); prop("Coin_Pile", 1.1, .5, 0, z=.81)
    prop("Lantern_Wall", -3.3, 2.69, 0, z=.9); prop("Lantern_Wall", 3.3, 2.69, 0, z=.9)
    prop("Bucket_Wooden_1", -1.7, .2, 0, r=.35)
    prop("Table_Plate", .6, .5, 0, z=.81)
    zc = .81
    for k in range(5): baguette(-1.7 + .06 * (k - 2), .2 + .05 * (k % 2), .58, 0, math.radians(82 + 3 * k), .62)
    for k in range(3): baguette(-.7 + .03 * k, .38 + .13 * k, zc + .032, math.radians(6 * k - 6))
    for k in range(3): croissant(.55 + .11 * (k - 1), .48 + .05 * (k % 2), zc + .03, math.radians(40 * k))
    for k in range(3): boule(.05 + .26 * k, .78, zc + .045)
    for sx in (-1.6, 1.6):
        for zz in (.7, 1.25):
            for k in range(4): boule(sx - .42 + .28 * k, 2.5, zz + .15, .085)
        for k in range(4): baguette(sx, 2.4 + .05 * k, 1.8 + .14, math.radians(2 * k))
    plan["habitants"]["boulangere"] = {"pos": t3(.3, 1.65), "regard": t3(.3, -1)}
    plan["comptoir"] = t3(.3, -.35)
    plan["camera"] = {"pos": t3(0, -7.6, 5.4), "cible": t3(0, .9, .8)}

# ---------------------------------------------------------------- allègement des matériaux, export
for o in list(bpy.data.objects):
    if o.users_collection and o.users_collection[0].name == "_modeles": bpy.data.objects.remove(o)
for m in bpy.data.materials:
    if not (m.use_nodes and m.node_tree): continue
    nt = m.node_tree; b = nt.nodes.get("Principled BSDF")
    if not b: continue
    for nom in ("Roughness", "Metallic"):
        for l in list(b.inputs[nom].links):
            src = l.from_node; nt.links.remove(l)
            if src.type == "SEPARATE_COLOR" or src.type == "SEPARATE_RGB":
                pass
    b.inputs["Roughness"].default_value = .85; b.inputs["Metallic"].default_value = 0
for im in bpy.data.images:
    if im.size[0] == 0: continue
    normal = "Normal" in im.name
    cible = 512 if normal else 1024
    if im.size[0] > cible: im.scale(cible, int(cible * im.size[1] / im.size[0]))

if RENDU:
    if QUOI == "exterieur":
        kit.scene_rendu(SORTIE + "rendu_exterieur.png", (0, -30, 17), (0, 2, 1), lens=26, res=(1100, 620), samples=16)
    else:
        for o in list(bpy.data.objects):
            if o.name.startswith("MurAvant_"): o.hide_render = True
        kit.scene_rendu(SORTIE + "rendu_interieur.png", (0, -7.6, 5.4), (0, .9, .8), lens=30, res=(1000, 620), samples=24)
        for o in list(bpy.data.objects): o.hide_render = False
    for o in list(bpy.data.objects):
        if o.type in ("LIGHT", "CAMERA"): bpy.data.objects.remove(o)

nom = "village" if QUOI == "exterieur" else "boulangerie"
bpy.ops.export_scene.gltf(filepath=SORTIE + nom + ".glb", export_format="GLB", export_image_format="WEBP",
                          export_animations=False, export_yup=True, export_cameras=False, export_lights=False)
json.dump(plan, open(SORTIE + nom + ".json", "w"), ensure_ascii=False, indent=1)
print("EXPORT", nom, len(bpy.data.objects), "objets")
