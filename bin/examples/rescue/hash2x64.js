"use strict";
/**
 * This STARK can be used to prove knowledge of a preimage for modified version of Rescue hash
 * function. In this specific instance, the parameters for the function are chosen as follows:
 * - p (field modulus)      : 2^64 - 21 * 2^30 + 1
 * - m (number of registers): 2
 * - N (rounds)             : 32
 *
 * Also in this instance the function is restricted to accepting a single value < p, and producing
 * a hash value that is also < p.
 *
 * An execution trace generated by computing Rescue hash for value 42 is shown at the end of this
 * file.
 *
 * Rescue construct is defined here: https://eprint.iacr.org/2019/426.pdf and the code for
 * computing instance parameters can be found here: https://github.com/KULeuven-COSIC/Marvellous
 */
Object.defineProperty(exports, "__esModule", { value: true });
// IMPORTS
// ================================================================================================
const index_1 = require("../../index");
// CONSTANTS
// ================================================================================================
const initialConstants = [
    1908230773479027697n, 11775995824954138427n, 11762118091073853017n, 1179928731377769464n
];
const roundConstants = [
    [
        3507676442884075254n, 14199898198859462402n, 9943771478517422846n, 5299008510059709046n,
        4876587438151046518n, 935380327644019241n, 11969155768995001697n, 8905176503159002610n,
        10209632462003885590n, 4094264109993537899n, 13783103540050167525n, 7244561326597804778n,
        13136579845459532606n, 5360204127205901439n, 17688104912985715754n, 13327045140049128725n,
        8381978233857855775n, 17173008252555749159n, 16851158199224461544n, 198447382074086442n,
        6525022393008508587n, 15123861172768054914n, 10416955771456577164n, 11131732656469473226n,
        2452137769288432333n, 4412015122616966251n, 11465432874127736482n, 5737914329229941931n,
        10297324169560390650n, 8193234160249188780n, 2724535690916515409n, 1291976646389720043n
    ], [
        17202444183124002971n, 17723456717189439036n, 3750639259183275092n, 7448158522061432535n,
        3164914583837294015n, 12646084612349376118n, 7395381026560285023n, 729218816014270996n,
        6265319720055610278n, 6560811038686569758n, 10193097109625174474n, 10009700032272605410n,
        5938544421064743176n, 12280906544861631781n, 8456857679341924027n, 11348815465318493332n,
        6252463877627126306n, 13030052548815547650n, 10857148724261265034n, 12423114749217998360n,
        2246658437530714125n, 11512829271452903113n, 4058847408561007989n, 7479642583779880883n,
        13859809880585885275n, 8887260856005721590n, 16705356207851584356n, 6630713008605848931n,
        15272332635899000284n, 8293330822552540371n, 3663678680344765735n, 6202077743967849795n
    ], [
        13832924244624368586n, 9528928158945462573n, 14179395919100586062n, 6969939104331843825n,
        7310089016056177663n, 2330122620296285666n, 366614009711950633n, 15868530560167501485n,
        13062220818183197584n, 13862631616076321733n, 7173753005560765122n, 7401758400845058914n,
        9637063954876722222n, 12866686223156530935n, 12581363180925564601n, 18095168288661498698n,
        705027512553866826n, 11889965370647053343n, 15427913285119170690n, 8002547776917692331n,
        9851209343392987354n, 17007018513892100862n, 13156544984969762532n, 17174851075492447770n,
        13752314705754602748n, 13854843066947953115n, 18247924359033306459n, 16205059579474396736n,
        1084973183965784029n, 16412335787336649629n, 14382883703753853349n, 12271654898018238098n
    ], [
        16169418098402584869n, 5525673020174675568n, 12936657854060094775n, 11948000946147909875n,
        15353833107488796089n, 14618049475397165649n, 3778101905464969682n, 6365740825469087467n,
        16234655844237036703n, 2799885056387663031n, 5302770125087202743n, 5660153358913361974n,
        16770940414519030354n, 7509765183491975519n, 4169330364728586675n, 5574639924268823631n,
        9363939970816876135n, 17273737051928351082n, 17191485912205891684n, 6684944805026392094n,
        5584485950418500906n, 2615283273796770954n, 7797794717456616920n, 17426764471212936270n,
        17235322656552057567n, 9981174656309333188n, 4589122101654576321n, 894484646987718932n,
        8582267286539513308n, 13903972190091769637n, 17428182081597550586n, 9464705238429071998n
    ]
];
// STARK DEFINITION
// ================================================================================================
const field = new index_1.PrimeField(2n ** 64n - 21n * 2n ** 30n + 1n);
const steps = 32;
const alpha = 3n;
const invAlpha = -6148914683720324437n;
// MDS matrix
const mds = [
    [18446744051160973310n, 18446744051160973301n],
    [4n, 13n]
];
const invMds = [
    [2049638227906774814n, 6148914683720324439n],
    [16397105823254198500n, 12297829367440648875n]
];
/** Rescue transition function; k0, k1, k2, k3 hold unrolled key constants */
const tFunctionScript = `
    a0: r0^${alpha};
    a1: r1^${alpha};

    b0: (${mds[0][0]} * a0) + (${mds[0][1]} * a1) + k0;
    b1: (${mds[1][0]} * a0) + (${mds[1][1]} * a1) + k1;

    c0: b0^(${invAlpha});
    c1: b1^(${invAlpha});

    d0: (${mds[0][0]} * c0) + (${mds[0][1]} * c1) + k2;
    d1: (${mds[1][0]} * c0) + (${mds[1][1]} * c1) + k3;
`;
/** Rescue transition constraints */
const tConstraintsScript = `
    a0: r0^${alpha};
    a1: r1^${alpha};

    b0: (${mds[0][0]} * a0) + (${mds[0][1]} * a1) + k0;
    b1: (${mds[1][0]} * a0) + (${mds[1][1]} * a1) + k1;

    c0: (n0 - k2);
    c1: (n1 - k3);
    
    d0: (${invMds[0][0]} * c0) + (${invMds[0][1]} * c1);
    d1: (${invMds[1][0]} * c0) + (${invMds[1][1]} * c1);
    
    e0: d0^${alpha};
    e1: d1^${alpha};
`;
// create the STARK for Rescue computation
const rescStark = new index_1.Stark({
    field: field,
    tExpressions: {
        [index_1.script]: tFunctionScript,
        n0: 'd0',
        n1: 'd1'
    },
    tConstraints: {
        [index_1.script]: tConstraintsScript,
        q0: `b0 - e0`,
        q1: `b1 - e1`
    },
    tConstraintDegree: 3,
    constants: [
        { values: roundConstants[0], pattern: 'repeat' },
        { values: roundConstants[1], pattern: 'repeat' },
        { values: roundConstants[2], pattern: 'repeat' },
        { values: roundConstants[3], pattern: 'repeat' }
    ]
});
// TESTING
// ================================================================================================
// Generate proof that hashing 42 with Rescue results in 14354339131598895532
// set up inputs and assertions
const inputs = buildInputs(42n);
const assertions = [
    { step: steps - 1, register: 0, value: 14354339131598895532n }
];
// generate a proof
const proof = rescStark.prove(assertions, steps, inputs);
console.log('-'.repeat(20));
// verify that the prover knows the value that hashes to 14354339131598895532
rescStark.verify(assertions, proof, steps);
console.log('-'.repeat(20));
console.log(`Proof size: ${Math.round(rescStark.sizeOf(proof) / 1024 * 100) / 100} KB`);
// HELPER FUNCTIONS
// ================================================================================================
/** Pre-computes the first step of Rescue computation */
function buildInputs(value) {
    const r = [
        field.add(value, initialConstants[0]),
        field.add(0n, initialConstants[1])
    ];
    // first step of round 1
    let a0 = field.exp(r[0], invAlpha);
    let a1 = field.exp(r[1], invAlpha);
    r[0] = field.add(field.add(field.mul(mds[0][0], a0), field.mul(mds[0][1], a1)), initialConstants[2]);
    r[1] = field.add(field.add(field.mul(mds[1][0], a0), field.mul(mds[1][1], a1)), initialConstants[3]);
    return r;
}
/* EXECUTION TRACES
 * ================================================================================================
 * Execution traces of Rescue computation are shown below:
 * - on the left: the execution trace of running Sponge() method with input [42]; in this case,
 *   a state is recorded after each step (2 per round).
 * - on the right: the execution trace from STARK computation; in this case, step 2 in a given round
 *   is combined with step 1 from the following round as described in the whitepaper. So, the trace
 *   can skip every other step. Also, the execution trace terminates after 1st step of round 32.
 *
 *                  ╒═══════════ Original Function ═════════════╕       ╒═════════════════ STARK ═══════════════════╕
 *  round   step    r0                      r1	                    |   r0                     r1
 *  0	    1       42                      0                       |
 *  0	    2       1908230773479027739	    11775995824954138427    |
 *  1	    1       6192394074115262567	    6362103795149910654     |   6192394074115262567    6362103795149910654     <- STARK starts out with these inputs
 *  1	    2       14235436695667447389    10212112854719144682    |
 *  2	    1       4443483495863871585	    18213808804803479104    |   4443483495863871585    18213808804803479104
 *  2	    2       7741183469403798391	    6347331225803919751     |
 *  3	    1       12298482428329212698    17330962085246333408    |   12298482428329212698   17330962085246333408
 *  4	    2       5625787762739911842	    7298309140415770238     |
 *  5	    1       8313646796226318584	    11641010825224956624    |   8313646796226318584    11641010825224956624
 *  5	    2       3536971337043492177	    6199877634490347893	    |
 *  6	    1       978482924564259844	    1504772570823547853     |   978482924564259844	   1504772570823547853
 *  6	    2       9587772738143780865	    593371534470436793	    |
 *  7	    1       5186520612742714234	    12963908037192828019    |   5186520612742714234	   12963908037192828019
 *  7	    2       14958006020707970142    5812678940633129397	    |
 *  8	    1       13556844045322480200    9370255526245022324	    |   13556844045322480200   9370255526245022324
 *  8	    2       5209123743309416556	    3421448805653717044	    |
 *  9	    1       6826812100069596115	    3767734035057720904	    |   6826812100069596115    3767734035057720904
 *  9	    2       7004361282643535514	    13669693348850263283    |
 *  10      1       9188856226247543083	    3351687690081566017	    |   9188856226247543083    3351687690081566017
 *  10      2       7323944770063389994	    12223102134895448980    |
 *  11      1       4083560747908219027	    18221171377692901817    |   4083560747908219027	   18221171377692901817
 *  11      2       7318846094432971572	    12454705956386970160    |
 *  12      1       15718390384883760212    12316572311146424020    |   15718390384883760212   12316572311146424020
 *  12      2       1352768701059281571	    3678128971630195068	    |
 *  13      1       1125051307685663609	    10573679192340848849    |   1125051307685663609	   10573679192340848849
 *  13      2       3918655941418559040	    11114931694193189358    |
 *  14      1       17514012653621998088    16649558855481918050    |   17514012653621998088   16649558855481918050
 *  14      2       15319837560709914379    9705703502808935406     |
 *  15      1       9391214203397792708	    8948807049610907051	    |   9391214203397792708	   8948807049610907051
 *  15      2       17039140040797699685    5648355597923301468	    |
 *  16      1       11869417477045016900    16125602680661515208    |   11869417477045016900   16125602680661515208
 *  16      2       10879959665900478916    9788819506433475326	    |
 *  17      1       15622260264780797563    17676602026916942111    |   15622260264780797563   17676602026916942111
 *  17      2       9970875907496364816	    4018854804967493775	    |
 *  18      1       11263866506403296395    3395909349124497933	    |   11263866506403296395   3395909349124497933
 *  18      2       12206504669047766550    2737018831357445192	    |
 *  19      1       7436209647172616652	    11095546667438737832    |   7436209647172616652	   11095546667438737832
 *  19      2       12951191624543726317    11756918128517485528    |
 *  20      1       13977911137029292561    7123382562034869052	    |   13977911137029292561   7123382562034869052
 *  20      2       10196137702945530755    16530008975547478480    |
 *  21      1       12765915320184852297    18222710437499261781    |   12765915320184852297   18222710437499261781
 *  21      2       3510101432442295756	    7047970939047430590	    |
 *  22      1       4203432975434035702	    17217054318931531174    |   4203432975434035702	   17217054318931531174
 *  22      2       6919336185017279297	    10751714047033011969    |
 *  23      1       9513331167665760302	    6625246843962557911	    |   9513331167665760302	   6625246843962557911
 *  23      2       8322671683267467626	    4448047256709285629	    |
 *  24      1       700236991263439132	    7713484789770087182	    |   700236991263439132	   7713484789770087182
 *  24      2       10793159502592859380    3678186958707583345	    |
 *  25      1       2053364846065995957	    10256034168563840023    |   2053364846065995957	   10256034168563840023
 *  25      2       5936500212438068751	    1562077346057657164	    |
 *  26      1       790388693683446933	    13255618738266494252    |   790388693683446933	   13255618738266494252
 *  26      2       15285257528619465884    12449196848526946550    |
 *  27      1       12872121840946251064    16031903000986157337    |   12872121840946251064   16031903000986157337
 *  27      2       14878452572381778262    8518840370028919097	    |
 *  28      1       17025530959440937859    17460181414067351157    |   17025530959440937859   17460181414067351157
 *  28      2       1714977379946141684	    14870879752778004505    |
 *  29      1       15097183929335660856    8195117861635325551	    |   15097183929335660856   8195117861635325551
 *  29      2       79198607169113554	     6547868967680134508    |
 *  30      1       11005033986037753086    8639151511101212086	    |   11005033986037753086   8639151511101212086
 *  30      2       13306767687057932694    2408861729904106632	    |
 *  31      1       427504626455762595	    15713595349449078118    |   427504626455762595	   15713595349449078118
 *  31      2       893215822675986474	    16013196806403095800    |
 *  32      1       14354339131598895532    13089448190414768876    |   14354339131598895532   13089448190414768876    <- STARK terminates 1 step earlier
 *  32      2       18174939043219985060    17194445737515289373    |
*/ 
//# sourceMappingURL=hash2x64.js.map