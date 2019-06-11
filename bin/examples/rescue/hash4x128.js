"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// IMPORTS
// ================================================================================================
const index_1 = require("../../index");
const utils_1 = require("./utils");
// STARK PARAMETERS
// ================================================================================================
const field = new index_1.PrimeField(2n ** 128n - 9n * 2n ** 32n + 1n);
const steps = 32;
const alpha = 3n;
const invAlpha = -113427455640312821154458202464371168597n;
// MDS matrix and its inverse
const mds = [
    [340282366920938463463374607393113505064n, 340282366920938463463374607393113476633n, 340282366920938463463374607393112623703n, 340282366920938463463374607393088807273n],
    [1080n, 42471n, 1277640n, 35708310n],
    [340282366920938463463374607393113505403n, 340282366920938463463374607393113491273n, 340282366920938463463374607393113076364n, 340282366920938463463374607393101570233n],
    [40n, 1210n, 33880n, 925771n]
];
const invMds = [
    [236997924285633886309140921207528337986n, 247254910923297358352547052529406562002n, 311342028444809266296393502237594936029n, 126030506267014245727175780515967965110n],
    [33069997328254894416993606273702832836n, 59740111947936946229464514160137230831n, 88480676416265968399408181712033476738n, 124630167308491865219096049621346098829n],
    [336618017400133662891528246258390023400n, 144341202744775798260123226512082052891n, 154884404066691444097361840554534567820n, 4667796528407935026932436315406220930n],
    [73878794827854483309086441046605817365n, 229228508225866824084614421584601165863n, 125857624914110248133585690282064031000n, 84953896817024417490170340940393220925n]
];
// Key constant parameters
const constants = [
    144517900019036866096022507193071809599n, 271707809579969091656092579345468860225n, 139424957805302989189422527487860690608n, 126750251129487986697737866024960215983n,
    271118613762407276564214152179206069413n, 39384648060424157691646880565718875760n, 189037434251220539428539337560615209464n, 218986062987136192416421725751708413726n,
    103808983578136303126641899945581033860n, 198823153506012419365570940451368319246n, 339599443104046223725845265111864465825n, 169004341575174204803282453992954960786n,
    171596418631454858790177474513731208863n, 157569361262795131998922854453557743690n, 211837534394685913032370295607135890739n, 328609939009439440841980058678511564944n,
    229628671790616575443886906286361261591n, 95675137928612392156876334331168593412n, 301613873771889848137714364785485714735n, 278224571298089265666737094541710980794n,
    140049647417493050970983064725330334359n, 159594320057012289760186736637936788141n, 44954493393746175043012738454844468290n, 223519669575552375517628855932195463175n
];
// create rescue instance, and use it to calculate key constants for every round of computation
const rescue = new utils_1.Rescue(field, alpha, invAlpha, 4, steps, mds, constants);
const keyStates = rescue.unrollConstants();
const { initialConstants, roundConstants } = rescue.groupConstants(keyStates);
// STARK DEFINITION
// ================================================================================================
const rescStark = new index_1.Stark({
    field: field,
    tFunction: `
        S: [$r0, $r1, $r2, $r3];
        K1: [$k0, $k1, $k2, $k3];
        K2: [$k4, $k5, $k6, $k7];

        MDS: ${index_1.inline.matrix(mds)};

        S: MDS # S^${alpha} + K1;
        out: MDS # S^(${invAlpha}) + K2;
    `,
    tConstraints: `
        S: [$r0, $r1, $r2, $r3];
        N: [$n0, $n1, $n2, $n3];
        K1: [$k0, $k1, $k2, $k3];
        K2: [$k4, $k5, $k6, $k7];

        MDS: ${index_1.inline.matrix(mds)};
        INV_MDS: ${index_1.inline.matrix(invMds)};

        T1: MDS # S^${alpha} + K1;
        T2: (INV_MDS # (N - K2))^${alpha};

        out: T1 - T2;
    `,
    tConstraintDegree: 3,
    constants: [
        { values: roundConstants[0], pattern: 'repeat' },
        { values: roundConstants[1], pattern: 'repeat' },
        { values: roundConstants[2], pattern: 'repeat' },
        { values: roundConstants[3], pattern: 'repeat' },
        { values: roundConstants[4], pattern: 'repeat' },
        { values: roundConstants[5], pattern: 'repeat' },
        { values: roundConstants[6], pattern: 'repeat' },
        { values: roundConstants[7], pattern: 'repeat' }
    ]
});
// TESTING
// ================================================================================================
// set up inputs and assertions
const inputs = buildInputs([42n, 43n]);
const assertions = [
    { step: steps - 1, register: 0, value: 302524937772545017647250309501879538110n },
    { step: steps - 1, register: 1, value: 205025454306577433144586673939030012640n },
];
// generate a proof
const proof = rescStark.prove(assertions, steps, inputs);
console.log('-'.repeat(20));
// verify the proof
rescStark.verify(assertions, proof, steps);
console.log('-'.repeat(20));
console.log(`Proof size: ${Math.round(rescStark.sizeOf(proof) / 1024 * 100) / 100} KB`);
// HELPER FUNCTIONS
// ================================================================================================
function buildInputs(values) {
    const r = [
        field.add(values[0], initialConstants[0]),
        field.add(values[1], initialConstants[1]),
        initialConstants[2],
        initialConstants[3]
    ];
    // first step of round 1
    const a = [
        field.exp(r[0], invAlpha),
        field.exp(r[1], invAlpha),
        field.exp(r[2], invAlpha),
        field.exp(r[3], invAlpha)
    ];
    for (let i = 0; i < 4; i++) {
        let sum = 0n;
        for (let j = 0; j < 4; j++) {
            sum = field.add(sum, field.mul(mds[i][j], a[j]));
        }
        r[i] = sum;
    }
    r[0] = field.add(r[0], initialConstants[4]);
    r[1] = field.add(r[1], initialConstants[5]);
    r[2] = field.add(r[2], initialConstants[6]);
    r[3] = field.add(r[3], initialConstants[7]);
    return r;
}
//# sourceMappingURL=hash4x128.js.map