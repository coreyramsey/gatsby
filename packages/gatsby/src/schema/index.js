/* @flow */
const _ = require(`lodash`)
const { GraphQLSchema, GraphQLObjectType } = require(`graphql`)
const { mergeSchemas } = require(`graphql-tools`)

const buildNodeTypes = require(`./build-node-types`)
const buildNodeConnections = require(`./build-node-connections`)
const { store } = require(`../redux`)
const invariant = require(`invariant`)

module.exports = async () => {
  const typesGQL = await buildNodeTypes()
  const connections = buildNodeConnections(_.values(typesGQL))

  // Pull off just the graphql node from each type object.
  const nodes = _.mapValues(typesGQL, `node`)

  invariant(!_.isEmpty(nodes), `There are no available GQL nodes`)
  invariant(!_.isEmpty(connections), `There are no available GQL connections`)

  const thirdPartySchemas = store.getState().thirdPartySchemas || []

  const gatsbySchema = new GraphQLSchema({
    query: new GraphQLObjectType({
      name: `RootQueryType`,
      fields: { ...connections, ...nodes },
    }),
  })

  thirdPartySchemas.forEach(schema => {
    console.log(typeof schema, schema instanceof GraphQLSchema)
  })

  const schema = mergeSchemas({
    schemas: [gatsbySchema, ...thirdPartySchemas],
  })

  store.dispatch({
    type: `SET_SCHEMA`,
    payload: schema,
  })
}
