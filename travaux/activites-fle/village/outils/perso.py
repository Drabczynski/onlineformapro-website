"""Assemble un habitant (corps de base + tenue + coiffure + animations) et l'exporte en GLB léger.
usage : python perso.py <nom> <F|M> <Light|Dark> <tenue 1|2> <coiffure> <couleur cheveux r,g,b> [rendu]"""
import bpy, sys, glob, math, mathutils
from mathutils.bvhtree import BVHTree

P = "/tmp/claude-0/-home-user-onlineformapro-website/b5e64a29-5f2d-5cad-ac6c-8b8d300e3834/scratchpad/monde/packs/"
SORTIE = "/tmp/claude-0/-home-user-onlineformapro-website/b5e64a29-5f2d-5cad-ac6c-8b8d300e3834/scratchpad/monde/glb/"
UBC = glob.glob(P + "Universal_Base_Characters/*/")[0]
OUT = glob.glob(P + "Outfits/*/")[0]
ANIMS = ["Idle_Loop", "Walk_Loop", "Idle_Talking_Loop", "Interact", "PickUp_Table"]

args = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else sys.argv[1:]
nom, sexe, peau, tenue, coiffure, cheveux = args[:6]
rendu = len(args) > 6
cheveux = [float(c) for c in cheveux.split(",")]
genre = "Female" if sexe == "F" else "Male"

bpy.ops.wm.read_factory_settings(use_empty=True)


def importer(chemin):
    avant = set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=chemin)
    return [o for o in bpy.data.objects if o not in avant]


# 1. corps de base
base = importer(UBC + f"Base Characters/Godot - UE/Superhero_{genre}_FullBody.gltf")
arm = next(o for o in base if o.type == "ARMATURE")
corps = max((o for o in base if o.type == "MESH" and not o.name.startswith(("Eye", "Icosphere"))), key=lambda o: len(o.data.vertices))
for o in base:
    if o.type == "MESH" and o.name.startswith("Icosphere"): bpy.data.objects.remove(o)
# peau claire ou foncée
tex_peau = UBC + ("Base Characters/Textures/" + (f"T_Superhero_{genre}_{peau}_BaseColor.png" if sexe == "F" else ("T_Superhero_Male_Ligh.png" if peau == "Light" else "T_Superhero_Male_Dark.png")))


def rattacher(objs):
    for o in list(objs):
        if o.type == "ARMATURE" and o != arm:
            for enfant in [c for c in objs if c.type == "MESH" and c.parent == o]:
                mw = enfant.matrix_world.copy(); enfant.parent = arm; enfant.matrix_world = mw
                for m in enfant.modifiers:
                    if m.type == "ARMATURE": m.object = arm
            bpy.data.objects.remove(o)
    for o in list(objs):
        try:
            if o.type == "MESH" and o.name.startswith("Icosphere"): bpy.data.objects.remove(o)
        except ReferenceError:
            pass


# 2. tenue de paysan(ne)
habits = importer(OUT + f"Exports/glTF (Godot-Unreal)/Outfits/{genre}_Peasant.gltf")
rattacher(habits)
habits = [o for o in arm.children if o.type == "MESH" and "Peasant" in o.name]
if tenue == "2":
    for o in habits:
        for m in o.data.materials:
            if m and m.use_nodes:
                for n in m.node_tree.nodes:
                    if n.type == "TEX_IMAGE" and n.image and n.image.name.startswith("T_Peasant_BaseColor"):
                        n.image = bpy.data.images.load(OUT + "Textures/Peasant/T_Peasant_2_BaseColor.png")

# 3. coiffure (accrochée à l'os de la tête)
if coiffure != "aucune":
    ch = importer(UBC + f"Hairstyles/Rigged to Head Bone/glTF (Godot -Unreal)/{coiffure}.gltf")
    rattacher(ch)
    sourcils = importer(UBC + f"Hairstyles/Rigged to Head Bone/glTF (Godot -Unreal)/Eyebrows_{'Female' if sexe == 'F' else 'Regular'}.gltf")
    rattacher(sourcils)
for o in arm.children:
    if o.type == "MESH" and ("Hair" in o.name or "Eyebrow" in o.name):
        for m in o.data.materials:
            if m and m.use_nodes:
                b = m.node_tree.nodes.get("Principled BSDF")
                for n in list(m.node_tree.nodes):
                    if n.type == "TEX_IMAGE" and "Normal" not in (n.image.name if n.image else ""):
                        # teinte : on multiplie la texture de cheveux par la couleur voulue
                        mix = m.node_tree.nodes.new("ShaderNodeMixRGB"); mix.blend_type = "MULTIPLY"; mix.inputs[0].default_value = 1
                        mix.inputs[2].default_value = (*cheveux, 1)
                        m.node_tree.links.new(n.outputs[0], mix.inputs[1]); m.node_tree.links.new(mix.outputs[0], b.inputs["Base Color"])

# 4. on retire la peau cachée sous les habits (évite qu'elle traverse en marchant)
dg = bpy.context.evaluated_depsgraph_get()
arbres = []
for o in habits:
    ev = o.evaluated_get(dg); me = ev.to_mesh()
    verts = [o.matrix_world @ v.co for v in me.vertices]; polys = [p.vertices[:] for p in me.polygons]
    arbres.append(BVHTree.FromPolygons(verts, polys)); ev.to_mesh_clear()
import bmesh
bm = bmesh.new(); bm.from_mesh(corps.data)
cache = []
for v in bm.verts:
    w = corps.matrix_world @ v.co
    for t in arbres:
        loc, nrm, i, d = t.find_nearest(w)
        if loc is not None and d < 0.035:
            cache.append(v); break
# on garde la tête, le cou et les mains même si un col passe près
hauts = [v for v in cache if (corps.matrix_world @ v.co).z > 1.38]
cache = [v for v in cache if v not in hauts]
bmesh.ops.delete(bm, geom=cache, context="VERTS")
bm.to_mesh(corps.data); bm.free()

# peau choisie
for m in corps.data.materials:
    for n in m.node_tree.nodes:
        if n.type == "TEX_IMAGE" and n.image and "BaseColor" in n.image.name or (n.type == "TEX_IMAGE" and n.image and n.image.name.startswith("T_Superhero_Male_D")):
            n.image = bpy.data.images.load(tex_peau)

# 5. textures légères : couleur seulement, 512 px (cheveux 256)
for o in arm.children:
    if o.type != "MESH": continue
    for m in o.data.materials:
        if not (m and m.use_nodes): continue
        nt = m.node_tree; b = nt.nodes.get("Principled BSDF")
        for n in list(nt.nodes):
            if n.type == "NORMAL_MAP": nt.nodes.remove(n)
        for n in list(nt.nodes):
            if n.type == "TEX_IMAGE" and n.image:
                lie_couleur = any(l.to_socket.name in ("Base Color", "Color1", "A") or l.to_node.type == "MIX_RGB" for l in n.outputs[0].links)
                if not lie_couleur and not ("Eye" in n.image.name):
                    nt.nodes.remove(n); continue
        if b:
            b.inputs["Roughness"].default_value = .85; b.inputs["Metallic"].default_value = 0
            for l in list(b.inputs["Roughness"].links) + list(b.inputs["Metallic"].links): nt.links.remove(l)
for im in bpy.data.images:
    if im.size[0] > 512:
        cible = 256 if "Hair" in im.name else 512
        im.scale(cible, cible)

# 6. animations de la bibliothèque universelle
avant_actions = set(bpy.data.actions)
lib = importer(glob.glob(P + "Universal_Animation_Library/*/Unreal-Godot/UAL1_Standard.glb")[0])
for o in lib: bpy.data.objects.remove(o)
for a in list(bpy.data.actions):
    if a in avant_actions: continue
    if a.name not in ANIMS: bpy.data.actions.remove(a)
arm.animation_data_create()
for a in bpy.data.actions:
    if a.name in ANIMS:
        tr = arm.animation_data.nla_tracks.new(); tr.name = a.name
        st = tr.strips.new(a.name, 1, a); tr.mute = True
        try:
            if a.slots: st.action_slot = a.slots[0]
        except Exception as e:
            print("slot", e)
print("ACTIONS", [a.name for a in bpy.data.actions])

for o in list(bpy.data.objects):
    if o.type == "MESH" and o.parent is None: bpy.data.objects.remove(o)
arm.name = nom

if rendu:
    # pose « attendre » pour le rendu de contrôle
    a = bpy.data.actions.get("Idle_Loop"); arm.animation_data.action = a
    try: arm.animation_data.action_slot = a.slots[0]
    except Exception: pass
    sc = bpy.context.scene; sc.frame_set(10)
    bpy.ops.object.light_add(type="SUN", rotation=(.9, .1, .4)); bpy.context.object.data.energy = 3.5
    w = bpy.data.worlds.new("w"); sc.world = w; w.use_nodes = True
    w.node_tree.nodes["Background"].inputs[0].default_value = (.6, .68, .8, 1)
    bpy.ops.object.camera_add(location=(0, -3.2, 1.05), rotation=(math.radians(88), 0, 0)); sc.camera = bpy.context.object
    sc.render.engine = "CYCLES"; sc.cycles.samples = 24; sc.render.resolution_x, sc.render.resolution_y = 300, 420
    sc.render.filepath = SORTIE + nom + ".png"; bpy.ops.render.render(write_still=True)
    arm.animation_data.action = None

bpy.ops.object.select_all(action="DESELECT")
bpy.ops.export_scene.gltf(filepath=SORTIE + nom + ".glb", export_format="GLB", export_image_format="WEBP",
                          export_animations=True, export_animation_mode="NLA_TRACKS", export_skins=True,
                          export_apply=False, export_yup=True)
print("EXPORT", nom)
