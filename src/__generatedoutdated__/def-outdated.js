// This is an auto-generated file, do not edit manually
export const definition = {
  models: {
    EthDenverAttendance: {
      interface: false,
      implements: [],
      id: "kjzl6hvfrbw6c798up51keuer1v1ig8na82srjwob1bmzq4fpqa15r7pnsllsim",
      accountRelation: { type: "list" },
    },
    PointAttestation: {
        interface: false,
        implements: [],
        id: "kjzl6hvfrbw6c8oa01h8jdjkzx2sgzx1404z550cfrnh9fehxn1c5iw5fnfvbqa",
        accountRelation: { type: "list" },
      },
      PointMaterialization: {
        interface: false,
        implements: [],
        id: "kjzl6hvfrbw6c6v62imp48u3wnw0t8g9pdkpnom1qyqinf0xgtngpy2dgnw5yan",
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
    PointAttestation: {
        data: {
          type: "list",
          required: true,
          item: {
            type: "reference",
            refType: "object",
            refName: "PointAttestationData",
            required: true,
          },
        },
        recipient: { type: "did", required: true },
        issuer: { type: "view", viewType: "documentAccount" },
      },
      PointAttestationData: {
        refId: { type: "streamid", required: false },
        value: { type: "integer", required: true },
        context: { type: "string", required: false },
        timestamp: { type: "datetime", required: true },
      },
      PointMaterialization: {
        value: { type: "integer", required: true },
        context: { type: "string", required: false },
        recipient: { type: "did", required: true },
        pointAttestationId: { type: "streamid", required: true },
        issuer: { type: "view", viewType: "documentAccount" },
        pointAttestation: {
          type: "view",
          viewType: "relation",
          relation: {
            source: "document",
            model:
              "kjzl6hvfrbw6c798up51keuer1v1ig8na82srjwob1bmzq4fpqa15r7pnsllsim",
            property: "pointAttestationId",
          },
        },
      },
  },
  enums: {},
  accountData: {
    ethDenverAttendanceList: {
      type: "connection",
      name: "EthDenverAttendance",
    },
    pointAttestationList: { type: "connection", name: "PointAttestation" },
    recipientOfPointAttestationList: {
      type: "account",
      name: "PointAttestation",
      property: "recipient",
    },
    recipientOfPointMaterializationList: {
      type: "account",
      name: "PointMaterialization",
      property: "recipient",
    },
    pointMaterializationList: {
      type: "connection",
      name: "PointMaterialization",
    },
  },
};
