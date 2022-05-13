import { typeDefs } from './graphql-schema'
import { ApolloServer } from 'apollo-server-express'
import express from 'express'
import neo4j from 'neo4j-driver'
import { makeAugmentedSchema} from 'neo4j-graphql-js'
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
import { compareSync, hashSync } from 'bcrypt'
import {IsAuthenticatedDirective} from 'graphql-auth-directives'

// set environment variables from .env
dotenv.config()

const app = express()


const resolvers = {
  Mutation: {
    login:(obj, args, context, info) => {
      const session = context.driver.session();
      return session
        .run(
          `MATCH (u:User {username: $username})
          RETURN u LIMIT 1`,
          { username: args.username }
        )
        .then((res) => {
          session.close();
          const { id, username, password } = res.records[0].get('u').properties;
          if (!compareSync(args.password, password)) {
            throw new Error('Authorization Error');
          }
          return {
            token: jwt.sign({ id, username }, process.env.JWT_SECRET, {
              //expiresIn: '30d'
            })
          };
        });
    
    }
  }
};

const schema = makeAugmentedSchema({
  typeDefs,
  resolvers,
  schemaDirectives:{
    isAuthenticated:IsAuthenticatedDirective
  },
  

  
})

/*
 * Create a Neo4j driver instance to connect to the database
 * using credentials specified as environment variables
 * with fallback to defaults
 */
const driver = neo4j.driver(
  process.env.NEO4J_URI || 'bolt://localhost:7687',
  neo4j.auth.basic(
    process.env.NEO4J_USER || 'neo4j',
    process.env.NEO4J_PASSWORD || 'neo4j'
  )
)

/*
 * Create a new ApolloServer instance, serving the GraphQL schema
 * created using makeAugmentedSchema above and injecting the Neo4j driver
 * instance into the context object so it is available in the
 * generated resolvers to connect to the database.
 */
const server = new ApolloServer({
  context: ({ req }) => {
    
    return {
      req,
      driver,
      neo4jDatabase: process.env.NEO4J_DATABASE,
      
    };
  },
  
  schema
});

// Specify host, port and path for GraphQL endpoint
const port = process.env.GRAPHQL_SERVER_PORT || 4001
const path = process.env.GRAPHQL_SERVER_PATH || '/graphql'
const host = process.env.GRAPHQL_SERVER_HOST || '0.0.0.0'

/*
 * Optionally, apply Express middleware for authentication, etc
 * This also also allows us to specify a path for the GraphQL endpoint
 */
server.applyMiddleware({ app, path })

app.listen({ host, port, path }, () => {
  console.log(`GraphQL server ready at http://${host}:${port}${path}`)
})

