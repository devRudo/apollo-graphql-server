import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import db from "./_db.js";

// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.
const typeDefs = `#graphql
  # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.

  type Game {
    id: ID!
    title: String!
    platform: [String!]!
    reviews: [Review!]
  }

  type Review {
    id: ID!
    rating: Int!
    content: String!
    game: Game!
    author: Author!
  }

  type Author {
    id: ID!
    name: String!
    verified: Boolean!
    reviews: [Review!]
  }

  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each. In this
  # case, the "books" query returns an array of zero or more Books (defined above).
  type Query {
    reviews: [Review]
    review(id:ID!): Review
    games: [Game]
    game(id:ID!): Game
    authors: [Author]
    author(id:ID!): Author
  }
`;

// Resolvers define the technique for fetching the types defined in the
// schema. This resolver retrieves books from the "books" array above.
const resolvers = {
  Query: {
    reviews: () => db.reviews,
    review: (_, args) => db.reviews.find((r) => r.id === args.id),
    games: () => db.games,
    game: (_, args) => db.games.find((g) => g.id === args.id),
    authors: () => db.authors,
    author: (_, args) => db.authors.find((a) => a.id === args.id),
  },
  Game: {
    reviews: (parent) => db.reviews.filter((r) => r.game_id === parent.id),
  },
  Author: {
    reviews: (parent) => db.reviews.filter((r) => r.author_id === parent.id),
  },
  Review: {
    game: (parent) => db.games.find((g) => g.id === parent.game_id),
    author: (parent) => db.authors.find((r) => r.id === parent.author_id),
  },
};

// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

// Passing an ApolloServer instance to the `startStandaloneServer` function:
//  1. creates an Express app
//  2. installs your ApolloServer instance as middleware
//  3. prepares your app to handle incoming requests
const { url } = await startStandaloneServer(server, { listen: { port: 4000 } });

console.log(`🚀 Server listening at: ${url}`);
