"""Outils communs : charger une pièce une seule fois, poser des copies liées, construire une maison."""
import bpy, math, glob, os, re
CANON = {}

R = "/tmp/claude-0/-home-user-onlineformapro-website/b5e64a29-5f2d-5cad-ac6c-8b8d300e3834/scratchpad/monde/packs/"
VIL = glob.glob(R + "Medieval_Village_MegaKit/*/glTF/")[0]
NAT = R + "Stylized_Nature_MegaKit/glTF/"
PROPS = R + "Fantasy_Props_MegaKit/Exports/glTF/"
MODELES = {}
cachee = None


def collection_modeles():
    global cachee
    if cachee is None:
        cachee = bpy.data.collections.new("_modeles"); bpy.context.scene.collection.children.link(cachee)
        cachee.hide_render = True; cachee.hide_viewport = True
    return cachee


def modele(nom, dossier=None):
    """Importe une pièce (une fois) et renvoie la liste (objet, matrice locale) de ses maillages."""
    if nom in MODELES: return MODELES[nom]
    chemin = None
    for d in ([dossier] if dossier else [VIL, NAT, PROPS]):
        if os.path.exists(d + nom + ".gltf"): chemin = d + nom + ".gltf"; break
    assert chemin, nom
    avant = set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=chemin)
    nouv = [o for o in bpy.data.objects if o not in avant]
    bpy.context.view_layer.update()
    mailles = []
    for o in nouv:
        if o.type == "MESH":
            for i, m in enumerate(o.data.materials):
                if m: o.data.materials[i] = CANON.setdefault(re.sub(r"\.\d{3}$", "", m.name), m)
        for c in o.users_collection: c.objects.unlink(o)
        collection_modeles().objects.link(o)
        if o.type == "MESH": mailles.append((o.data, o.matrix_world.copy()))
    MODELES[nom] = mailles
    return mailles


def poser(nom, x, y, z=0, rz=0, s=1, coll=None, dossier=None):
    """Pose une copie liée de la pièce (rotation rz en degrés autour de la verticale)."""
    from mathutils import Matrix
    M = Matrix.Translation((x, y, z)) @ Matrix.Rotation(math.radians(rz), 4, "Z") @ Matrix.Scale(s, 4)
    objs = []
    for me, mw in modele(nom, dossier):
        o = bpy.data.objects.new(nom, me); o.matrix_world = M @ mw
        (coll or bpy.context.scene.collection).objects.link(o); objs.append(o)
    return objs


def mur(nom, x, y, cote, z=0, coll=None):
    """cote : 'avant' (face vers -y), 'arriere' (+y), 'gauche' (-x), 'droite' (+x)."""
    rz = {"avant": 0, "arriere": 180, "gauche": -90, "droite": 90}[cote]
    return poser(nom, x, y, z, rz, coll=coll)


def maison(cx, cy, larg, prof, etages=2, porte=None, fenetres_rdc=None, pierre=True, toit=None, coll=None,
           facade="avant", rdc_sol="Floor_WoodDark", haut="WoodGrid", volets=True, toit_rot=0, pignons=True):
    """Maison rectangulaire de larg (x) × prof (y) mètres, multiples de 2, centrée en (cx, cy).
    porte : index de la travée de façade (0 = la plus à gauche) qui reçoit la porte."""
    objs = []
    nx, ny = larg // 2, prof // 2
    x0, y0 = cx - larg / 2, cy - prof / 2
    bas = "UnevenBrick" if pierre else "Plaster"
    for e in range(etages):
        z = e * 3
        for cote in ("avant", "arriere", "gauche", "droite"):
            n = nx if cote in ("avant", "arriere") else ny
            for i in range(n):
                if cote == "avant": px, py = x0 + 1 + 2 * i, y0
                elif cote == "arriere": px, py = x0 + larg - 1 - 2 * i, y0 + prof
                elif cote == "gauche": px, py = x0, y0 + prof - 1 - 2 * i
                else: px, py = x0 + larg, y0 + 1 + 2 * i
                est_facade = cote == facade
                if e == 0:
                    if est_facade and porte == i:
                        objs += mur(f"Wall_{bas}_Door_Round", px, py, cote, z, coll)
                        dx, dy = {"avant": (-.53, 0), "arriere": (.53, 0), "gauche": (0, .53), "droite": (0, -.53)}[cote]
                        objs += mur("Door_1_Round", px + dx, py + dy, cote, z, coll)
                    elif (est_facade and (fenetres_rdc is None or i in fenetres_rdc)) or (not est_facade and i % 2 == 1):
                        objs += mur(f"Wall_{bas}_Window_Wide_Round", px, py, cote, z, coll)
                        objs += mur("Window_Wide_Round1", px, py, cote, z, coll)
                        if volets: objs += mur("WindowShutters_Wide_Round_Open", px, py, cote, z, coll)
                    else:
                        objs += mur(f"Wall_{bas}_Straight", px, py, cote, z, coll)
                else:
                    if i % 2 == 0 or est_facade:
                        objs += mur("Wall_Plaster_Window_Wide_Flat", px, py, cote, z, coll)
                        objs += mur("Window_Wide_Flat1", px, py, cote, z, coll)
                        if volets: objs += mur("WindowShutters_Wide_Flat_Open", px, py, cote, z, coll)
                    else:
                        objs += mur(f"Wall_Plaster_{haut}" if haut != "Straight" else "Wall_Plaster_Straight", px, py, cote, z, coll)
            # poteaux d'angle
        for (ax, ay) in ((x0, y0), (x0 + larg, y0), (x0, y0 + prof), (x0 + larg, y0 + prof)):
            objs += poser("Corner_Exterior_Wood" if e > 0 or not pierre else "Corner_Exterior_Brick", ax, ay, z, coll=coll)
        # planchers
        for i in range(nx):
            for j in range(ny):
                objs += poser(rdc_sol if e == 0 else "Floor_WoodDark", x0 + 1 + 2 * i, y0 + 1 + 2 * j, z + (0.02 if e == 0 else 0), coll=coll)
    zt = etages * 3
    for i in range(nx):
        for j in range(ny):
            objs += poser("Floor_WoodDark", x0 + 1 + 2 * i, y0 + 1 + 2 * j, zt, coll=coll)
    if toit:
        objs += poser(toit, cx, cy, zt, toit_rot, coll=coll)
        if pignons:
            # pignons (triangles de bois) aux deux bouts du faîtage
            portee = int(toit.split("_")[-1].split("x")[0])
            g = f"Roof_Front_Brick{portee}"
            if toit_rot % 180 == 0:
                objs += poser(g, cx, y0, zt, 0, coll=coll); objs += poser(g, cx, y0 + prof, zt, 180, coll=coll)
            else:
                objs += poser(g, x0, cy, zt, -90, coll=coll); objs += poser(g, x0 + larg, cy, zt, 90, coll=coll)
    return objs


def scene_rendu(chemin, cam_loc, cam_cible, lens=30, res=(960, 540), samples=20, soleil=(50, 0, 35)):
    import mathutils
    sc = bpy.context.scene
    if not any(o.type == "LIGHT" for o in sc.objects):
        bpy.ops.object.light_add(type="SUN", rotation=tuple(math.radians(a) for a in soleil)); bpy.context.object.data.energy = 3.2
        bpy.context.object.data.angle = math.radians(3)
        w = bpy.data.worlds.new("w"); sc.world = w; w.use_nodes = True
        w.node_tree.nodes["Background"].inputs[0].default_value = (.55, .7, .95, 1); w.node_tree.nodes["Background"].inputs[1].default_value = 1.0
    cam = bpy.data.objects.get("CamRendu")
    if not cam:
        cd = bpy.data.cameras.new("CamRendu"); cam = bpy.data.objects.new("CamRendu", cd); sc.collection.objects.link(cam)
    cam.location = cam_loc; d = mathutils.Vector(cam_cible) - mathutils.Vector(cam_loc)
    cam.rotation_euler = d.to_track_quat("-Z", "Y").to_euler(); cam.data.lens = lens; sc.camera = cam
    sc.render.engine = "CYCLES"; sc.cycles.samples = samples; sc.cycles.use_denoising = True
    sc.render.resolution_x, sc.render.resolution_y = res
    sc.view_settings.view_transform = "AgX"
    sc.render.filepath = chemin; bpy.ops.render.render(write_still=True)
