"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../index");
const utils_1 = require("../../lib/utils");
// STARK DEFINITION
// ================================================================================================
const steps = 2 ** 6, result = 3964567481n;
const demoStark = index_1.instantiateScript(Buffer.from(`
define Demo over prime field (2^32 - 3 * 2^25 + 1) {

    TODO

    transition 1 register {
        for each ($i0) {
            init { $i0 }
            for steps [1..${steps - 1}] {
                when ($p0) {
                    $s0 ? $r0 + 1 : $r0^2;
                }
                else {
                    $r0 + $p1 * $s1;
                }
            }
        }
    }

    enforce 1 constraint {
        for all steps {
            enforce transition($r) = $n;
        }
    }

    using 4 readonly registers {
        $p0: repeat binary [...];
        $p1: spread [...];
        $s0: repeat binary [...];
        $s1: spread [...];
    }
}`), undefined, new utils_1.Logger(false));
// TESTING
// =================================================================================================
// set up inputs and assertions
const inputs = [[0n]];
const auxPublicInputs = [[0n, 1n], [1n, 2n, 3n, 4n, 5n, 6n, 7n, 8n]];
const auxSecretInputs = [[0n, 0n, 0n, 1n], [9n, 11n, 13n, 15n]];
const assertions = [
    { step: 0, register: 0, value: inputs[0][0] },
    { step: steps - 1, register: 0, value: result }
];
// generate a proof
const proof = demoStark.prove(assertions, inputs); // TODO
console.log('-'.repeat(20));
// verify the proof
demoStark.verify(assertions, proof, auxPublicInputs);
console.log('-'.repeat(20));
// EXECUTION TRACE
// ================================================================================================
// step	p0	p1	s0	s1	r0
// 0    0   1   0   9   0
// 1    1   1   0   9   9
// 2    0   1   0   9   81
// 3    1   1   1   9   90
// 4    0   1   0   9   91
// 5    1   1   0   9   100
// 6    0   1   0   9   10000
// 7    1   1   1   9   10009
// 8    0   2   0   9   10010
// 9    1   2   0   9   10028
// 10   0   2   0   9   100560784
// 11   1   2   1   9   100560802
// 12   0   2   0   9   100560803
// 13   1   2   0   9   100560821
// 14   0   2   0   9   3385175039
// 15   1   2   1   9   3385175057
// 16   0   3   0   11  3385175058
// 17   1   3   0   11  3385175091
// 18   0   3   0   11  2004449938
// 19   1   3   1   11  2004449971
// 20   0   3   0   11  2004449972
// 21   1   3   0   11  2004450005
// 22   0   3   0   11  3979409133
// 23   1   3   1   11  3979409166
// 24   0   4   0   11  3979409167
// 25   1   4   0   11  3979409211
// 26   0   4   0   11  1373173985
// 27   1   4   1   11  1373174029
// 28   0   4   0   11  1373174030
// 29   1   4   0   11  1373174074
// 30   0   4   0   11  2176193726
// 31   1   4   1   11  2176193770
// 32   0   5   0   13  2176193771
// 33   1   5   0   13  2176193836
// 34   0   5   0   13  1963159514
// 35   1   5   1   13  1963159579
// 36   0   5   0   13  1963159580
// 37   1   5   0   13  1963159645
// 38   0   5   0   13  1320861825
// 39   1   5   1   13  1320861890
// 40   0   6   0   13  1320861891
// 41   1   6   0   13  1320861969
// 42   0   6   0   13  629377707
// 43   1   6   1   13  629377785
// 44   0   6   0   13  629377786
// 45   1   6   0   13  629377864
// 46   0   6   0   13  165032964
// 47   1   6   1   13  165033042
// 48   0   7   0   15  165033043
// 49   1   7   0   15  165033148
// 50   0   7   0   15  415880350
// 51   1   7   1   15  415880455
// 52   0   7   0   15  415880456
// 53   1   7   0   15  415880561
// 54   0   7   0   15  2465334645
// 55   1   7   1   15  2465334750
// 56   0   8   0   15  2465334751
// 57   1   8   0   15  2465334871
// 58   0   8   0   15  3225748076
// 59   1   8   1   15  3225748196
// 60   0   8   0   15  3225748197
// 61   1   8   0   15  3225748317
// 62   0   8   0   15  3964567361
// 63   1   8   1   15  3964567481
//# sourceMappingURL=conditional.js.map