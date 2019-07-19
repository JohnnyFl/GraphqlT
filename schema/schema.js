const graphql = require("graphql");
const axios = require("axios");
const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLSchema,
  GraphQLList,
  GraphQLNonNull
} = graphql;

const CompanyType = new GraphQLObjectType({
  name: "Company",
  fields: () => ({
    id: { type: GraphQLString },
    name: { type: GraphQLString },
    description: { type: GraphQLString },
    users: {
      type: new GraphQLList(UserType),
      resolve: (parent, args) =>
        axios
          .get(`http://localhost:3000/companies/${parent.id}/users`)
          .then(res => res.data)
    }
  })
});

const UserType = new GraphQLObjectType({
  name: "User",
  fields: () => ({
    id: { type: GraphQLString },
    firstName: { type: GraphQLString },
    age: { type: GraphQLInt },
    company: {
      type: CompanyType,
      resolve: (parent, args) =>
        axios
          .get(`http://localhost:3000/companies/${parent.companyId}`)
          .then(res => res.data)
    }
  })
});

const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    users: {
      type: new GraphQLList(UserType),
      resolve: (parent, args) =>
        axios.get(`http://localhost:3000/users`).then(res => res.data)
    },
    user: {
      type: UserType,
      args: { id: { type: GraphQLString } },
      resolve: (parent, args) =>
        axios
          .get(`http://localhost:3000/users/${args.id}`)
          .then(response => response.data)
    },
    company: {
      type: CompanyType,
      args: { id: { type: GraphQLString } },
      resolve: (parent, args) =>
        axios
          .get(`http://localhost:3000/companies/${args.id}`)
          .then(res => res.data)
    }
  }
});

const mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    addUser: {
      type: UserType,
      args: {
        firstName: { type: new GraphQLNonNull(GraphQLString) },
        age: { type: new GraphQLNonNull(GraphQLInt) },
        companyId: { type: GraphQLString }
      },
      resolve: (parent, { firstName, age }) =>
        axios
          .post("http://localhost:3000/users", { firstName, age })
          .then(res => res.data)
    },
    deleteUser: {
      type: UserType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) }
      },
      resolve: (parent, { id }) =>
        axios.delete(`http://localhost:3000/users/${id}`).then(() => ({
          message: "User has been deleted!"
        }))
    },
    updateUser: {
      type: UserType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) },
        firstName: { type: new GraphQLNonNull(GraphQLString) },
        age: { type: new GraphQLNonNull(GraphQLInt) },
        companyId: { type: new GraphQLNonNull(GraphQLString) }
      },
      resolve: (parent, args) =>
        axios
          .patch(`http://localhost:3000/users/${id}`, args)
          .then(res => res.data)
    }
  }
});

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation
});
