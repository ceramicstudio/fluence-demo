// This is an auto-generated file, do not edit manually
export const definition = {
    models: {
      EthDen24Attendance: {
        interface: true,
        implements: [],
        id: "kjzl6hvfrbw6caafcgc0wc5798oy5hz135w3wf9tdcb51prjc3xphw7iondi4tz",
        accountRelation: { type: "none" },
      },
      EthDen24RepCon: {
        interface: false,
        implements: [
          "kjzl6hvfrbw6caafcgc0wc5798oy5hz135w3wf9tdcb51prjc3xphw7iondi4tz",
        ],
        id: "kjzl6hvfrbw6c7h89i4guper7x19w3d9vvuulhmq89sg02z9wcfsnt5gvurzdqn",
        accountRelation: { type: "single" },
      },
      EthDen24DePin: {
        interface: false,
        implements: [
          "kjzl6hvfrbw6caafcgc0wc5798oy5hz135w3wf9tdcb51prjc3xphw7iondi4tz",
        ],
        id: "kjzl6hvfrbw6c59nb0ycy2n47zp5swmcmuenf8wdaompnp7nvbuqijzopa5uq8x",
        accountRelation: { type: "single" },
      },
    },
    objects: {
      EthDen24Attendance: {
        jwt: { type: "string", required: true },
        latitude: { type: "float", required: true },
        longitude: { type: "float", required: true },
        recipient: { type: "string", required: true },
        timestamp: { type: "datetime", required: true },
        controller: { type: "view", viewType: "documentAccount" },
      },
      EthDen24RepCon: {
        jwt: { type: "string", required: true },
        latitude: { type: "float", required: true },
        longitude: { type: "float", required: true },
        recipient: { type: "string", required: true },
        timestamp: { type: "datetime", required: true },
        controller: { type: "view", viewType: "documentAccount" },
      },
      EthDen24DePin: {
        jwt: { type: "string", required: true },
        latitude: { type: "float", required: true },
        longitude: { type: "float", required: true },
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
  