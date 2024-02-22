import { serveEncodedDefinition } from "@composedb/devtools-node";

/**
 * Runs GraphiQL server to view & query composites.
 */
const server = await serveEncodedDefinition({
  ceramicURL: "https://ceramic-demo.hirenodes.io",
  graphiql: true,
  path: "./src/__generated__/definition.json",
  port: 5006,
});


