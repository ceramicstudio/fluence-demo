// This is an auto-generated file, do not edit manually
export const definition = {
  models: {
    PointClaims: {
      interface: false,
      implements: [],
      id: "kjzl6hvfrbw6c80bfxfy0hm7nsn978jwjrmoju294jvzv9mu2lcr6g17ri6qgt3",
      accountRelation: { type: "list" },
    },
    EthDenverAttendance: {
      interface: false,
      implements: [],
      id: "kjzl6hvfrbw6c5epp3zh9x7rm2xunszrotp7kc9tuh3f3azqdfhx3h6ivf0hidq",
      accountRelation: { type: "list" },
    },
    PointMaterializations: {
      interface: false,
      implements: [],
      id: "kjzl6hvfrbw6c7x410cdiy03gf5n3iiwnn20sf6p31db8kuxk25u8dfop4x8koy",
      accountRelation: { type: "list" },
    },
  },
  objects: {
    Data: {
      refId: { type: "streamid", required: false },
      value: { type: "integer", required: true },
      context: { type: "string", required: false },
      timestamp: { type: "datetime", required: true },
    },
    PointClaims: {
      data: {
        type: "list",
        required: true,
        item: {
          type: "reference",
          refType: "object",
          refName: "Data",
          required: true,
        },
      },
      issuer: { type: "did", required: true, indexed: true },
      issuer_verification: { type: "string", required: true },
      holder: { type: "view", viewType: "documentAccount" },
    },
    EthDenverAttendance: {
      jwt: { type: "string", required: true },
      event: { type: "string", required: true, indexed: true },
      issuer: { type: "did", required: true, indexed: true },
      latitude: { type: "float", required: false, indexed: true },
      longitude: { type: "float", required: false, indexed: true },
      recipient: { type: "string", required: true, indexed: true },
      timestamp: { type: "datetime", required: true, indexed: true },
      controller: { type: "view", viewType: "documentAccount" },
    },
    PointMaterializations: {
      value: { type: "integer", required: true },
      context: { type: "string", required: false },
      recipient: { type: "did", required: true, indexed: true },
      pointClaimsId: { type: "streamid", required: true },
      issuer: { type: "view", viewType: "documentAccount" },
      pointClaim: {
        type: "view",
        viewType: "relation",
        relation: {
          source: "document",
          model:
            "kjzl6hvfrbw6c80bfxfy0hm7nsn978jwjrmoju294jvzv9mu2lcr6g17ri6qgt3",
          property: "pointClaimsId",
        },
      },
    },
  },
  enums: {},
  accountData: {
    issuerOfPointClaimsList: {
      type: "account",
      name: "PointClaims",
      property: "issuer",
    },
    pointClaimsList: { type: "connection", name: "PointClaims" },
    issuerOfEthDenverAttendanceList: {
      type: "account",
      name: "EthDenverAttendance",
      property: "issuer",
    },
    ethDenverAttendanceList: {
      type: "connection",
      name: "EthDenverAttendance",
    },
    recipientOfPointMaterializationsList: {
      type: "account",
      name: "PointMaterializations",
      property: "recipient",
    },
    pointMaterializationsList: {
      type: "connection",
      name: "PointMaterializations",
    },
  },
};
