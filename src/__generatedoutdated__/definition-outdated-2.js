// This is an auto-generated file, do not edit manually
export const definition = {
  models: {
    EthDenverAttendance: {
      interface: false,
      implements: [],
      id: "kjzl6hvfrbw6c7oj39nvw09t8jmwdostlg5k57qss5gs7yokr2spauw3senwozy",
      accountRelation: { type: "list" },
    },
  },
  objects: {
    EthDenverAttendance: {
      jwt: { type: "string", required: true },
      event: { type: "string", required: true, indexed: true },
      latitude: { type: "float", required: false, indexed: true },
      longitude: { type: "float", required: false, indexed: true },
      recipient: { type: "string", required: true, indexed: true },
      timestamp: { type: "datetime", required: true, indexed: true },
      controller: { type: "view", viewType: "documentAccount" },
    },
  },
  enums: {},
  accountData: {
    ethDenverAttendanceList: {
      type: "connection",
      name: "EthDenverAttendance",
    },
  },
};
