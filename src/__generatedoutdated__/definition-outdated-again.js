// This is an auto-generated file, do not edit manually
export const definition = {
  models: {
    EthDen24Attendance: {
      interface: true,
      implements: [],
      id: "kjzl6hvfrbw6c6jhqxv5m0yri8c8iepjoebattw5q4xxnstt3f7lhpqkduqk45u",
      accountRelation: { type: "none" },
    },
    OpenDataDay: {
      interface: false,
      implements: [
        "kjzl6hvfrbw6c6jhqxv5m0yri8c8iepjoebattw5q4xxnstt3f7lhpqkduqk45u",
      ],
      id: "kjzl6hvfrbw6ca1mo91fjq8b6lnaiaxcken0m2u1u0mcyzuqjoqtnsuwx7pvpcn",
      accountRelation: { type: "single" },
    },
    FluenceBooth: {
      interface: false,
      implements: [
        "kjzl6hvfrbw6c6jhqxv5m0yri8c8iepjoebattw5q4xxnstt3f7lhpqkduqk45u",
      ],
      id: "kjzl6hvfrbw6caoti0p0qqwno5g4c2smre0yt80qd7yw6lo7e8oakpnvayasar6",
      accountRelation: { type: "single" },
    },
    DePinDay: {
      interface: false,
      implements: [
        "kjzl6hvfrbw6c6jhqxv5m0yri8c8iepjoebattw5q4xxnstt3f7lhpqkduqk45u",
      ],
      id: "kjzl6hvfrbw6c5s0zpztma60fy644djyq4t0geqcccx2fmvknz4kawekqbl1cbu",
      accountRelation: { type: "single" },
    },
    DeSciDay: {
      interface: false,
      implements: [
        "kjzl6hvfrbw6c6jhqxv5m0yri8c8iepjoebattw5q4xxnstt3f7lhpqkduqk45u",
      ],
      id: "kjzl6hvfrbw6ca5gzh227gpie4d4onygn5nq07pl2ujin6jcl3l11h7mmwegmvo",
      accountRelation: { type: "single" },
    },
    TalentDAOHackerHouse: {
      interface: false,
      implements: [
        "kjzl6hvfrbw6c6jhqxv5m0yri8c8iepjoebattw5q4xxnstt3f7lhpqkduqk45u",
      ],
      id: "kjzl6hvfrbw6c8do6890w3noosqnbm1iegxe56rwj7mnptandeewvftm65smfqe",
      accountRelation: { type: "single" },
    },
    ProofOfData: {
      interface: false,
      implements: [
        "kjzl6hvfrbw6c6jhqxv5m0yri8c8iepjoebattw5q4xxnstt3f7lhpqkduqk45u",
      ],
      id: "kjzl6hvfrbw6c52wdbq2nujtgwizhjkkuuv36t0wlqvd2l8ohgf9e11gfs58qe3",
      accountRelation: { type: "single" },
    },
  },
  objects: {
    EthDen24Attendance: {
      jwt: { type: "string", required: true },
      latitude: { type: "float", required: false },
      longitude: { type: "float", required: false },
      recipient: { type: "string", required: true },
      timestamp: { type: "datetime", required: true },
      controller: { type: "view", viewType: "documentAccount" },
    },
    OpenDataDay: {
      jwt: { type: "string", required: true },
      latitude: { type: "float", required: false },
      longitude: { type: "float", required: false },
      recipient: { type: "string", required: true },
      timestamp: { type: "datetime", required: true },
      controller: { type: "view", viewType: "documentAccount" },
    },
    FluenceBooth: {
      jwt: { type: "string", required: true },
      latitude: { type: "float", required: false },
      longitude: { type: "float", required: false },
      recipient: { type: "string", required: true },
      timestamp: { type: "datetime", required: true },
      controller: { type: "view", viewType: "documentAccount" },
    },
    DePinDay: {
      jwt: { type: "string", required: true },
      latitude: { type: "float", required: false },
      longitude: { type: "float", required: false },
      recipient: { type: "string", required: true },
      timestamp: { type: "datetime", required: true },
      controller: { type: "view", viewType: "documentAccount" },
    },
    DeSciDay: {
      jwt: { type: "string", required: true },
      latitude: { type: "float", required: false },
      longitude: { type: "float", required: false },
      recipient: { type: "string", required: true },
      timestamp: { type: "datetime", required: true },
      controller: { type: "view", viewType: "documentAccount" },
    },
    TalentDAOHackerHouse: {
      jwt: { type: "string", required: true },
      latitude: { type: "float", required: false },
      longitude: { type: "float", required: false },
      recipient: { type: "string", required: true },
      timestamp: { type: "datetime", required: true },
      controller: { type: "view", viewType: "documentAccount" },
    },
    ProofOfData: {
      jwt: { type: "string", required: true },
      latitude: { type: "float", required: false },
      longitude: { type: "float", required: false },
      recipient: { type: "string", required: true },
      timestamp: { type: "datetime", required: true },
      controller: { type: "view", viewType: "documentAccount" },
    },
  },
  enums: {},
  accountData: {
    ethDen24AttendanceList: { type: "connection", name: "EthDen24Attendance" },
    openDataDay: { type: "node", name: "OpenDataDay" },
    fluenceBooth: { type: "node", name: "FluenceBooth" },
    dePinDay: { type: "node", name: "DePinDay" },
    deSciDay: { type: "node", name: "DeSciDay" },
    talentDaoHackerHouse: { type: "node", name: "TalentDAOHackerHouse" },
    proofOfData: { type: "node", name: "ProofOfData" },
  },
};
