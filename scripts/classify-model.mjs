import model from "../public/model.json" with { type: "json" };
import {
  buildAssessmentFromModelWithModel,
  classifyWithModel,
} from "../src/lib/classifier-core.ts";

const EXAMPLES = {
  "pac-271": {
    age: 63,
    sex: "M",
    chestPainType: "ASY",
    restingBP: 145,
    cholesterol: 289,
    fastingBS: 1,
    maxHR: 118,
    exerciseAngina: "Sí",
    oldpeak: 1.8,
    restingECG: "ST",
    stSlope: "Flat",
  },
  "pac-318": {
    age: 68,
    sex: "F",
    chestPainType: "ATA",
    restingBP: 138,
    cholesterol: 241,
    fastingBS: 1,
    maxHR: 126,
    exerciseAngina: "Sí",
    oldpeak: 2.1,
    restingECG: "LVH",
    stSlope: "Flat",
  },
  "pac-402": {
    age: 52,
    sex: "M",
    chestPainType: "TA",
    restingBP: 124,
    cholesterol: 198,
    fastingBS: 0,
    maxHR: 162,
    exerciseAngina: "No",
    oldpeak: 0.1,
    restingECG: "Normal",
    stSlope: "Up",
  },
};

function parseArgs(argv) {
  const args = {};

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];

    if (token === "--features") {
      args.features = argv[index + 1];
      index += 1;
    } else if (token === "--example") {
      args.example = argv[index + 1];
      index += 1;
    } else if (token === "--help") {
      args.help = true;
    }
  }

  return args;
}

function printHelp() {
  console.log(`
Uso:
  npm run classify:model -- --example pac-271
  npm run classify:model -- --features '{"age":63,"sex":"M","chestPainType":"ASY","restingBP":145,"cholesterol":289,"fastingBS":1,"maxHR":118,"exerciseAngina":"Sí","oldpeak":1.8,"restingECG":"ST","stSlope":"Flat"}'

Examples disponibles:
  ${Object.keys(EXAMPLES).join(", ")}
`);
}

function getFeaturesFromArgs(args) {
  if (args.example) {
    const selected = EXAMPLES[args.example];
    if (!selected) {
      throw new Error(`Example desconocido: ${args.example}`);
    }
    return selected;
  }

  if (args.features) {
    return JSON.parse(args.features);
  }

  throw new Error("Debes indicar --example o --features.");
}

try {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    printHelp();
    process.exit(0);
  }

  const features = getFeaturesFromArgs(args);
  const result = classifyWithModel(model, features);
  const assessment = buildAssessmentFromModelWithModel(model, features);

  console.log(JSON.stringify({ features, result, assessment }, null, 2));
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  printHelp();
  process.exit(1);
}
