"""Portraits des habitants (personnages chibi KayKit, sans accessoires de combat), fond transparent."""
import bpy, math
from mathutils import Vector
M = "/tmp/claude-0/-home-user-onlineformapro-website/b5e64a29-5f2d-5cad-ac6c-8b8d300e3834/scratchpad/monde/"
K = M + "kay/kaykit-adventurers/KayKit_Adventurers_2.0_FREE/"
PERSOS = [("gare", "Ranger", ["Ranger_Cape", "Ranger_Quiver"]), ("mairie", "Mage", ["Mage_Hat", "Mage_Cape"]),
          ("voisin", "Barbarian", ["Barbarian_BearHat"]), ("boulangere", "Rogue", ["Rogue_Cape"]), ("pharmacien", "Knight", ["Knight_Helmet", "Knight_Cape"])]
for nom, perso, retirer in PERSOS:
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=K + "Animations/gltf/Rig_Medium/Rig_Medium_General.glb")
    idle = next(a for a in bpy.data.actions if a.name.startswith("Idle_A"))
    for o in list(bpy.data.objects): bpy.data.objects.remove(o)
    bpy.ops.import_scene.gltf(filepath=K + f"Characters/gltf/{perso}.glb")
    for o in [o for o in bpy.data.objects if o.name.startswith("Icosphere") or any(o.name.startswith(r) for r in retirer)]: bpy.data.objects.remove(o)
    arm = next(o for o in bpy.data.objects if o.type == "ARMATURE")
    arm.animation_data_create(); arm.animation_data.action = idle
    try: arm.animation_data.action_slot = idle.slots[0]
    except Exception: pass
    sc = bpy.context.scene; sc.frame_set(8); bpy.context.view_layer.update()
    tete = next(o for o in bpy.data.objects if o.type == "MESH" and "_Head" in o.name)
    dg = bpy.context.evaluated_depsgraph_get(); ev = tete.evaluated_get(dg); me = ev.to_mesh()
    pts = [ev.matrix_world @ v.co for v in me.vertices]; c = sum(pts, Vector()) / len(pts); ev.to_mesh_clear()
    cd = bpy.data.cameras.new("c"); cd.type = "ORTHO"; cd.ortho_scale = 1.75
    cam = bpy.data.objects.new("c", cd); sc.collection.objects.link(cam); sc.camera = cam
    cible = c + Vector((0, 0, -.22)); pos = cible + Vector((1.6, -5, .9))
    cam.location = pos; cam.rotation_euler = (cible - pos).to_track_quat("-Z", "Y").to_euler()
    for rot, e in (((50, 0, 30), 3.2), ((60, 0, -120), 1.2)):
        bpy.ops.object.light_add(type="SUN", rotation=tuple(math.radians(a) for a in rot)); bpy.context.object.data.energy = e; bpy.context.object.data.angle = .3
    w = bpy.data.worlds.new("w"); sc.world = w; w.use_nodes = True; w.node_tree.nodes["Background"].inputs[0].default_value = (.8, .85, 1, 1); w.node_tree.nodes["Background"].inputs[1].default_value = .7
    sc.render.engine = "CYCLES"; sc.cycles.samples = 48; sc.render.film_transparent = True; sc.render.image_settings.color_mode = "RGBA"
    sc.render.resolution_x = sc.render.resolution_y = 360; sc.view_settings.view_transform = "Standard"
    sc.render.filepath = M + f"sprites/portrait-{nom}.png"; bpy.ops.render.render(write_still=True); print("PORTRAIT", nom, flush=True)
