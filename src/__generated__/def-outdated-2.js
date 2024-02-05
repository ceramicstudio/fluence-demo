// This is an auto-generated file, do not edit manually
export const definition = {
    models: {
      EthDen24Attendance: {
        interface: true,
        implements: [],
        id: "kjzl6hvfrbw6c6jhqxv5m0yri8c8iepjoebattw5q4xxnstt3f7lhpqkduqk45u",
        accountRelation: { type: "none" },
      },
      EthDen24RepCon: {
        interface: false,
        implements: [
          "kjzl6hvfrbw6c6jhqxv5m0yri8c8iepjoebattw5q4xxnstt3f7lhpqkduqk45u",
        ],
        id: "kjzl6hvfrbw6cay52x58x67ksgivtchsj8htrp9vv4lmi92qrnxzukevxoioc6u",
        accountRelation: { type: "single" },
      },
      EthDen24DePin: {
        interface: false,
        implements: [
          "kjzl6hvfrbw6c6jhqxv5m0yri8c8iepjoebattw5q4xxnstt3f7lhpqkduqk45u",
        ],
        id: "kjzl6hvfrbw6c5xgsds5nt4hc3ko925rp7j8s9m361vuiw8jc27yo0p5wdb29sz",
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
      EthDen24RepCon: {
        jwt: { type: "string", required: true },
        latitude: { type: "float", required: false },
        longitude: { type: "float", required: false },
        recipient: { type: "string", required: true },
        timestamp: { type: "datetime", required: true },
        controller: { type: "view", viewType: "documentAccount" },
      },
      EthDen24DePin: {
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
      ethDen24RepCon: { type: "node", name: "EthDen24RepCon" },
      ethDen24DePin: { type: "node", name: "EthDen24DePin" },
    },
  };
  