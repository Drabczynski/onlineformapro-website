"""Extrait du pack Low Poly City les modèles retenus pour « Ma ville », orientés façade vers +Z (three), mis à l'échelle des cases (1 case = 2 unités)."""
import bpy, bmesh, sys, re, math, os
from mathutils import Vector, Matrix
SRC, OUT, TEX = sys.argv[-3], sys.argv[-2], sys.argv[-1]
bpy.ops.wm.open_mainfile(filepath=SRC)
CASE = 2.0
# nom dans le jeu : (modèle du pack, cases en largeur, cases en profondeur, échelle max)
SEL = {
  'maison0a': ('house_02', 1, 1), 'maison0b': ('house_04', 1, 1), 'maison0c': ('house_05', 1, 1),
  'maison1a': ('house_03', 1, 1), 'maison1b': ('house_06', 1, 1),
  'maison2a': ('house_09', 1, 1), 'maison2b': ('house_10', 1, 1), 'maison2c': ('house_08', 1, 1),
  'maison3a': ('highlivingbuilding_a', 1, 1), 'maison3b': ('highlivingbuilding_b', 1, 1),
  'mairie': ('government_a', 2, 1), 'boulangerie': ('restaurant', 1, 1), 'epicerie': ('supermarket_b', 2, 1), 'garage': ('gasstation_b', 2, 2),
  'chateau': ('farmstractures_26', 1, 1, 2.2), 'ecole': ('school_a', 2, 2), 'medecin': ('hospital_a', 2, 1), 'police': ('policestation', 1, 1),
  'pompiers': ('antiques', 1, 1), 'poste': ('postoffice', 1, 1), 'banque': ('bank', 1, 1), 'parc': ('park_c', 1, 1), 'parc2': ('park_b', 1, 1),
  'stade': ('nationalstadium', 5, 3),
  'maison0d': ('house_03', 1, 1), 'maison1c': ('house_01', 1, 1), 'maison1d': ('house_07', 1, 1),
  'hotel': ('hotel_b', 1, 1), 'affaires': ('businesscenter', 1, 1), 'tour': ('skyscraper_b', 2, 2), 'gratteciel': ('skyscraper_c', 3, 2), 'tourgeante': ('skyscraper_a', 4, 2),
  'supermarche': ('supermarket_a', 2, 1), 'immeuble_c': ('highlivingbuilding_c', 1, 1), 'immeuble_d': ('highlivingbuilding_d', 1, 1), 'boutique': ('boutique', 1, 1), 'hotel2': ('hotel_a', 1, 1),
  'cafe': ('caffeeshop', 1, 1), 'fromagerie': ('cheesemarket', 1, 1), 'primeur': ('fruitshop', 1, 1), 'fleuriste': ('flowers', 1, 1), 'glacier': ('ice-cream', 1, 1),
  'cremerie': ('milk', 1, 1), 'jardinerie': ('plants', 1, 1), 'sport': ('sport', 1, 1), 'musique': ('musicshop', 1, 1), 'horloger': ('watches', 1, 1),
  'voyages': ('travel agency', 1, 1), 'meubles': ('armchairs', 1, 1), 'legumes': ('vegetables', 1, 1), 'usine': ('factorybuilding_a', 2, 2), 'ferme': ('farmbuilding_05', 2, 1),
  'ballon_a': ('airballoon_a', 0, 0, 1.0), 'ballon_b': ('airballoon_b', 0, 0, 1.0),
  'arbre': ('tree', 0, 0, 1.0), 'voiture_a': ('car_a', 0, 0, 1.0), 'voiture_c': ('car_c', 0, 0, 1.0), 'voiture_e': ('car_e', 0, 0, 1.0),
  'voiture_h': ('car_h', 0, 0, 1.0), 'jeep': ('jeep_b', 0, 0, 1.0),
  'route_droite': ('road_a_02', 1, 1, 'route'), 'route_06': ('road_a_06', 1, 1, 'route'), 'route_12': ('road_a_12', 1, 1, 'route'), 'route_13': ('road_a_13', 1, 1, 'route'),
}
base = lambda o: re.sub(r'\.\d+$', '', o.name)
routes = [o for o in bpy.data.objects if o.type == 'MESH' and base(o).startswith('road_')]
def boite(o, M=None):
    M = M or o.matrix_world; pts = [M @ Vector(c) for c in o.bound_box]; return Vector(map(min, *pts)), Vector(map(max, *pts))
if TEX != '-':
    for im in bpy.data.images:
        if im.name.startswith('color_512'): im.filepath = TEX; im.reload()
col = bpy.data.collections.new('EXPORT'); bpy.context.scene.collection.children.link(col)
for jeu, spec in SEL.items():
    nom, w, d = spec[:3]; extra = spec[3] if len(spec) > 3 else None
    inst = [o for o in bpy.data.objects if o.type == 'MESH' and base(o) == nom and not o.parent]
    o = inst[0]
    R = o.matrix_world.to_3x3().to_4x4()   # rotation + échelle du monde, sans position
    if extra == 'route' or w == 0: rz = 0
    else:   # la façade regarde la route la plus proche : on la tourne vers -Y (Blender) = +Z (three)
        mn, mx = boite(o); c = (mn + mx) / 2
        r = min(routes, key=lambda x: ((boite(x)[0] + boite(x)[1]) / 2 - c).xy.length)
        v = ((boite(r)[0] + boite(r)[1]) / 2 - c).xy
        ang = math.atan2(v.y, v.x); rz = -math.pi / 2 - round(ang / (math.pi / 2)) * (math.pi / 2)
    M = Matrix.Rotation(rz, 4, 'Z') @ R
    mn, mx = boite(o, M); taille = mx - mn
    if extra == 'route': S = Matrix.Diagonal(Vector((CASE / taille.x, CASE / taille.y, CASE / 15, 1)))
    else:
        if w: s = min(w * 15 * .94 / taille.x, d * 15 * .94 / taille.y)
        else: s = 1.0
        if isinstance(extra, float): s = min(s, extra)
        k = s * CASE / 15; S = Matrix.Diagonal(Vector((k, k, k, 1)))
    M2 = S @ M; mn, mx = boite(o, M2); ctr = (mn + mx) / 2
    T = Matrix.Translation(Vector((-ctr.x, -ctr.y, -mn.z)))
    me = o.data.copy()
    while len(me.uv_layers) > 1: me.uv_layers.remove(me.uv_layers[-1])
    bm = bmesh.new(); bm.from_mesh(me); bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=.002); bm.to_mesh(me); bm.free()
    n = bpy.data.objects.new(jeu, me); n.matrix_world = T @ M2; col.objects.link(n)
    poly = len(me.polygons)
    plafond = 600 if jeu.startswith(('voiture', 'jeep', 'camion')) else 1500 if jeu.startswith('parc') else 9000 if jeu in ('tourgeante', 'affaires', 'stade') else 3500
    if poly > plafond:
        m = n.modifiers.new('dec', 'DECIMATE'); m.ratio = max(.2, plafond / poly)
    dg = bpy.context.evaluated_depsgraph_get(); print('OK', len(n.evaluated_get(dg).data.polygons), jeu, nom, 'rz', round(math.degrees(rz)), 'poly', poly, 'taille', [round(v, 2) for v in boite(n)[1] - boite(n)[0]])
for ob in bpy.context.scene.objects: ob.select_set(ob.name in SEL)
bpy.ops.export_scene.gltf(filepath=OUT, export_format='GLB', use_selection=True, export_apply=True, export_yup=True, export_image_format='JPEG', export_jpeg_quality=92, export_animations=False, export_materials='EXPORT', export_normals=False, export_texcoords=True)
print('TAILLE', os.path.getsize(OUT))
