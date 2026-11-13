import json, re, zipfile, os, sys
BP = os.path.join(os.path.dirname(__file__), 'sources', 'bp3d')
idx = json.load(open(os.path.join(BP, 'index.json')))
def side_of(n):
    n = n.lower()
    if re.search(r'\bleft\b', n): return 'L'
    if re.search(r'\bright\b', n): return 'R'
    return 'C'
def base(n):
    n = n.lower()
    n = re.sub(r'\b(left|right)\s+', '', n)
    return n.strip()
# ---- bones ----
BONE_RX = re.compile(r'^(frontal bone|parietal bone|occipital bone|temporal bone|sphenoid bone|ethmoid|maxilla|zygomatic bone|nasal bone|mandible|lacrimal bone|palatine bone|vomer|inferior nasal concha|atlas|axis|(first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth|eleventh|twelfth) (cervical|thoracic|lumbar) vertebra|sacrum|coccyx|(first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth|eleventh|twelfth) rib|manubrium|body of sternum|xiphoid process|clavicle|scapula|humerus|radius|ulna|scaphoid|lunate|triquetrum|pisiform|trapezium|trapezoid|capitate|hamate|(first|second|third|fourth|fifth) metacarpal bone|(proximal|middle|distal) phalanx of .*(thumb|finger)|hip bone|femur|patella|tibia|fibula|talus|calcaneus|navicular bone of foot|cuboid bone|(medial|intermediate|lateral) cuneiform bone|(first|second|third|fourth|fifth) metatarsal bone|(proximal|middle|distal) phalanx of .*(toe))$')
CART_RX = re.compile(r'^((first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth) costal cartilage|intervertebral disk of .*|lateral nasal cartilage|major alar cartilage|septal nasal cartilage|external ear)$')
TOOTH_RX = re.compile(r'^(upper|lower) ((central|lateral) secondary incisor|secondary canine|(first|second) secondary (premolar|molar)) tooth$')
EYE_RX = re.compile(r'^(sclera|cornea)$')
# ---- muscles: superficial (translucent shell) and deep (opaque) ----
SUP = [
 'sternocleidomastoid', 'descending part of trapezius', 'transverse part of trapezius', 'ascending part of trapezius',
 'levator scapulae', 'splenius capitis', 'sternohyoid', 'omohyoid', 'sternothyroid', 'thyrohyoid',
 'clavicular part of deltoid', 'acromial part of deltoid', 'spinal part of deltoid', 'infraspinatus muscle', 'teres major', 'teres minor',
 'clavicular part of pectoralis major', 'sternocostal part of pectoralis major', 'abdominal part of pectoralis major', 'serratus anterior', 'external oblique', 'linea alba',
 'long head of biceps brachii', 'short head of biceps brachii', 'long head of triceps brachii', 'lateral head of triceps brachii', 'medial head of triceps brachii', 'brachialis', 'coracobrachialis', 'brachioradialis', 'anconeus',
 'humeral head of pronator teres', 'ulnar head of pronator teres', 'flexor carpi radialis', 'palmaris longus', 'humeral head of flexor carpi ulnaris', 'ulnar head of flexor carpi ulnaris', 'flexor digitorum superficialis',
 'extensor carpi radialis longus', 'extensor carpi radialis brevis', 'extensor digitorum', 'extensor digiti minimi', 'extensor carpi ulnaris', 'abductor pollicis longus', 'extensor pollicis brevis', 'extensor pollicis longus',
 'gluteus maximus', 'gluteus medius', 'tensor fasciae latae', 'iliotibial tract',
 'sartorius', 'rectus femoris', 'vastus lateralis', 'vastus medialis', 'gracilis', 'adductor longus', 'adductor magnus', 'pectineus',
 'long head of biceps femoris', 'semitendinosus', 'semimembranosus',
 'medial head of gastrocnemius', 'lateral head of gastrocnemius', 'soleus', 'calcaneal tendon', 'tibialis anterior', 'extensor digitorum longus', 'extensor hallucis longus', 'fibularis longus', 'fibularis brevis', 'fibularis tertius',
 # hand and foot
 'abductor pollicis brevis', 'flexor pollicis brevis', 'abductor digiti minimi of hand', 'flexor digiti minimi brevis of hand', 'set of dorsal interossei of hand', 'set of lumbricals of hand', 'flexor retinaculum of wrist',
 'abductor hallucis', 'flexor digitorum brevis', 'abductor digiti minimi of foot', 'extensor hallucis brevis',
]
DEEP = [
 'splenius cervicis', 'semispinalis capitis', 'semispinalis cervicis', 'semispinalis thoracis', 'longissimus capitis', 'longissimus cervicis', 'longissimus thoracis',
 'iliocostalis cervicis', 'iliocostalis thoracis', 'iliocostalis lumborum', 'spinalis thoracis', 'rhomboid major', 'rhomboid minor', 'serratus posterior superior', 'serratus posterior inferior',
 'scalenus anterior', 'scalenus medius', 'scalenus posterior', 'rectus capitis posterior major', 'rectus capitis posterior minor', 'obliquus capitis inferior', 'obliquus capitis superior',
 'supraspinatus', 'subscapularis', 'pectoralis minor', 'subclavius', 'external intercostal muscle',
 'psoas major', 'iliacus', 'gluteus minimus', 'piriformis', 'gemellus superior', 'gemellus inferior', 'obturator internus', 'obturator externus', 'quadratus femoris',
 'vastus intermedius', 'adductor brevis', 'adductor minimus', 'short head of biceps femoris', 'popliteus', 'plantaris', 'tibialis posterior', 'flexor digitorum longus', 'flexor hallucis longus',
 'flexor digitorum profundus', 'flexor pollicis longus', 'pronator quadratus', 'supinator', 'extensor indicis',
 # hand and foot
 'opponens pollicis', 'oblique head of adductor pollicis', 'transverse head of adductor pollicis', 'opponens digiti minimi of hand', 'set of palmar interossei of hand',
 'first lumbrical of foot', 'second lumbrical of foot', 'third lumbrical of foot', 'fourth lumbrical of foot', 'first plantar interosseous of foot', 'second plantar interosseous of foot', 'third plantar interosseous of foot',
 'oblique head of adductor hallucis', 'transverse head of adductor hallucis', 'medial head of flexor hallucis brevis', 'lateral head of flexor hallucis brevis', 'flexor digiti minimi brevis of foot', 'opponens digiti minimi of foot',
]
def mbase(n):
    b = base(n)
    b = re.sub(r'\bof (left|right) ', 'of ', b)
    b = re.sub(r'\s+muscle$', ' muscle', b)
    return b
sel = []
seen = {}
for e in idx:
    n = e['name']
    if not n: continue
    b = mbase(n)
    s = side_of(n)
    cat = None
    if BONE_RX.match(b) or TOOTH_RX.match(b): cat = 'bone'
    elif EYE_RX.match(b): cat = 'eye'
    elif CART_RX.match(b): cat = 'cart'
    elif b in SUP: cat = 'sup'
    elif b in DEEP: cat = 'deep'
    elif b == 'skin': cat = 'skin'
    if not cat: continue
    cxm = (e['bounds'][0] + e['bounds'][3]) / 2
    if s in 'LR' and abs(cxm) > 8 and (s == 'L') != (cxm > 0):
        print('side fixed:', n, round(cxm))
        s = 'L' if cxm > 0 else 'R'
        n = re.sub(r'(left|right|Left|Right)', lambda m: {'left': 'right', 'right': 'left', 'Left': 'Right', 'Right': 'Left'}[m.group(0)], n)
    key = (b, s)
    # duplicates (same concept split): keep all files, they are separate elements
    sel.append({'file': e['file'], 'name': n, 'base': b, 'side': s, 'cat': cat, 'bounds': e['bounds'], 'size': e['size']})
# report
from collections import Counter, defaultdict
c = Counter(x['cat'] for x in sel)
print(c, 'MB', round(sum(x['size'] for x in sel)/1e6, 1))
found = set(x['base'] for x in sel)
for lst, nm in ((SUP, 'SUP'), (DEEP, 'DEEP')):
    miss = [m for m in lst if m not in found]
    print(nm, 'missing:', miss)
dup = defaultdict(list)
for x in sel: dup[(x['base'], x['side'])].append(x['file'])
print('multi-file:', {k: v for k, v in dup.items() if len(v) > 1})
sides = Counter((x['cat'], x['side']) for x in sel)
print(sides)
json.dump(sel, open(os.path.join(os.path.dirname(__file__), 'selection.json'), 'w'), indent=0)
# extract
z = zipfile.ZipFile(os.path.join(BP, 'isa_BP3D_4.0_obj_99.zip'))
out = os.path.join(os.path.dirname(__file__), 'obj'); os.makedirs(out, exist_ok=True)
for x in sel:
    p = os.path.join(out, x['file'] + '.obj')
    if not os.path.exists(p):
        with open(p, 'wb') as f: f.write(z.read('isa_BP3D_4.0_obj_99/' + x['file'] + '.obj'))
print('extracted', len(sel))
