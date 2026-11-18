"""Habitant chibi KayKit : personnage sans accessoires de combat, palette repeinte, animations utiles, export GLB léger.
usage : python kay_perso.py <nom> <Personnage> <pièces à retirer, séparées par des virgules> [repeindre:<role>]"""
import bpy, sys, math, mathutils
from collections import Counter
M = "/tmp/claude-0/-home-user-onlineformapro-website/b5e64a29-5f2d-5cad-ac6c-8b8d300e3834/scratchpad/monde/"
K = M + "kay/kaykit-adventurers/KayKit_Adventurers_2.0_FREE/"
A = M + "kay/kaykit-character-animations/KayKit_Character_Animations_1.1/Animations/gltf/Rig_Medium/"
args = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else sys.argv[1:]
nom, perso, retirer = args[0], args[1], [r for r in args[2].split(",") if r]
role = args[3].split(":")[1] if len(args) > 3 else None
GARDER = {"Idle_A", "Idle_B", "Walking_A", "Interact", "PickUp", "Use_Item", "Waving", "Cheering"}
HAUTEUR = 1.5

bpy.ops.wm.read_factory_settings(use_empty=True)


def importer(chemin):
    avant = set(bpy.data.objects); bpy.ops.import_scene.gltf(filepath=chemin)
    return [o for o in bpy.data.objects if o not in avant]


objs = importer(K + f"Characters/gltf/{perso}.glb")
arm = next(o for o in objs if o.type == "ARMATURE")
for o in [o for o in objs if o.name.startswith("Icosphere") or (o.type == "MESH" and any(o.name.startswith(r) for r in retirer))]:
    bpy.data.objects.remove(o)
mailles = [o for o in arm.children if o.type == "MESH"]


def cases(o):
    c = Counter()
    for l in o.data.uv_layers.active.data:
        u, v = l.uv; c[(min(7, int(u * 8)), min(3, int((1 - v) * 4)))] += 1
    return c


# repeindre des cases de la palette (8 × 4 dégradés) : vêtements de métier
REPEINT = {
    "boulangere": {"Body": [(2, (.98, .96, .91), (.84, .80, .73)), (1, (.98, .96, .91), (.84, .80, .73))]},
}
mat = mailles[0].data.materials[0]
img = next(n.image for n in mat.node_tree.nodes if n.type == "TEX_IMAGE")
img = img.copy(); img.name = nom + "_palette"
if role in REPEINT:
    W, H = img.size; px = list(img.pixels)
    for partie, regles in REPEINT[role].items():
        corps = next(o for o in mailles if partie in o.name)
        haut = cases(corps).most_common(3)
        for rang, clair, fonce in regles:
            if rang > len(haut): continue
            cx, cy = haut[rang - 1][0]
            y0 = H - (cy + 1) * H // 4
            for yy in range(y0, y0 + H // 4):
                t = (yy - y0) / (H // 4)
                c = [fonce[k] + (clair[k] - fonce[k]) * t for k in range(3)]
                for xx in range(cx * W // 8, (cx + 1) * W // 8):
                    i = 4 * (yy * W + xx); px[i:i + 3] = c
    img.pixels = px
img.scale(256, 256)
m2 = mat.copy(); m2.name = nom
for n in m2.node_tree.nodes:
    if n.type == "TEX_IMAGE": n.image = img
for o in mailles:
    for i in range(len(o.data.materials)): o.data.materials[i] = m2

# taille : environ 1,5 m
bpy.context.view_layer.update()
h = max((o.matrix_world @ mathutils.Vector(c)).z for o in mailles for c in o.bound_box)
arm.scale = (HAUTEUR / h,) * 3

# animations (même squelette Rig_Medium)
for f in ["Rig_Medium_General.glb", "Rig_Medium_MovementBasic.glb", "Rig_Medium_Simulation.glb"]:
    avant = set(bpy.data.actions)
    for o in importer(A + f): bpy.data.objects.remove(o)
    for a in set(bpy.data.actions) - avant:
        if a.name not in GARDER: bpy.data.actions.remove(a)
arm.animation_data_create()
for a in bpy.data.actions:
    tr = arm.animation_data.nla_tracks.new(); tr.name = a.name
    st = tr.strips.new(a.name, 1, a); tr.mute = True
    try:
        if a.slots: st.action_slot = a.slots[0]
    except Exception as e: print("slot", e)
arm.name = nom
print("ACTIONS", sorted(a.name for a in bpy.data.actions))
bpy.ops.export_scene.gltf(filepath=M + "glb/" + nom + ".glb", export_format="GLB", export_image_format="WEBP",
                          export_animations=True, export_animation_mode="NLA_TRACKS", export_skins=True, export_yup=True)
print("EXPORT", nom)
