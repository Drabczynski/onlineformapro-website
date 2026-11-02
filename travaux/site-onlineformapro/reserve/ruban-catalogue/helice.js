// Le ruban du catalogue, posé dans le monde de lignes : entre le carrefour du cube et le
// croisement de la planète, la route entre dans un rond-point ; son anneau se soulève, se
// redresse et monte en hélice, un seul ruban qui porte les vignettes des familles.
//
// Partagé par le monde (monde.js : le rond-point, les bords lumineux du ruban, la caméra) et
// par le ruban (ruban.js : les images, sur sa propre toile, sans tonalité ni halo).
//
// Le ruban se repère par s, en familles (une famille par sixième de tour) : s = 0 en haut,
// où il se perd dans la nuit ; il descend en tournant jusqu'à s = VERTICAL, puis se pose :
// il rejoint le sol en se couchant, et devient l'anneau du rond-point (s = VERTICAL + POSE).
// En travers, v va de -1 (bord du bas, à l'intérieur une fois couché) à 1.
import * as THREE from 'three';

export const HELICE = {
  centre: new THREE.Vector3(100, 0, -420),   // au sol, sur la liaison du cube à la planète
  rayon: 6, largeur: 3.3,
  parTour: 6,                     // familles par tour
  pas: 5.6,                       // montée par tour
  vertical: 12,                   // la partie debout (deux tours)
  pose: 3,                        // la pose (un demi-tour, face à la caméra) : il descend, se couche et devient la route
  bas: 2.2,                       // hauteur du milieu du ruban au début de la pose
  face: -70 * Math.PI / 180,      // l'angle tourné vers la caméra pendant l'arrêt (vers le cube)
  sFace: 7.5,                     // la place, sur le ruban, de la famille au premier plan
  distance: 35,                   // la caméra de l'arrêt : à cette distance de l'axe…
  hauteurVue: 17,                 // … et à cette hauteur
};
const H = HELICE, DELTA = Math.PI * 2 / H.parTour, MONTEE = H.pas / H.parTour;
export const HAUT = H.bas + H.vertical * MONTEE;           // le milieu du ruban, tout en haut
export const MILIEU = H.bas + (H.vertical - H.sFace) * MONTEE;   // à hauteur de la famille au premier plan

// l'angle autour de l'axe (0 : vers +z), la hauteur du milieu du ruban et son inclinaison
// (0 debout, 1 couché à plat, le bord du haut vers l'extérieur)
export function lieu(s) {
  const a = H.face + (s - H.sFace) * DELTA;
  if (s <= H.vertical) return { a, y: H.bas + (H.vertical - s) * MONTEE, t: 0 };
  const u = Math.min(1, (s - H.vertical) / H.pose);
  return { a, y: 0.03 + (H.bas - 0.03) * Math.pow(1 - u, 1.3), t: 1 - Math.pow(1 - u, 2) };
}
// le point (s, v) du ruban ; v au-delà de ±1 : un peu en dehors (les bords lumineux)
export function point(s, v, cible = new THREE.Vector3()) {
  const { a, y, t } = lieu(s), sa = Math.sin(a), ca = Math.cos(a);
  const c = Math.cos(t * Math.PI / 2), e = Math.sin(t * Math.PI / 2), d = v * H.largeur / 2;
  return cible.set(H.centre.x + sa * (H.rayon + e * d), y + c * d, H.centre.z + ca * (H.rayon + e * d));
}
// une direction au sol, vue du centre (angle autour de l'axe)
export const versLExterieur = (a) => new THREE.Vector3(Math.sin(a), 0, Math.cos(a));

// les bords lumineux du ruban, un peu en dehors des images : du haut (ils s'y effacent avec
// les images) jusqu'à l'anneau du rond-point, où ils se couchent ; [bord du bas (à l'intérieur
// une fois couché), bord du haut]
export const MARGE_BORDS = 0.12;
export function courbesBords() {
  const fin = H.vertical + H.pose, v = 1 + MARGE_BORDS * 2 / H.largeur;
  return [-v, v].map((w) => {
    const l = [];
    for (let s = 0.3; s <= fin + 1e-6; s += 0.1) l.push(point(s, w));
    return new THREE.CatmullRomCurve3(l);
  });
}
