/*
** As per:
** http://dev.apollodata.com/tools/graphql-tools/mocking.html
** Note that there are references on the web to graphql-tools.mockServer,
** but these seem to be out of date.
*/

const { graphql, GraphQLScalarType } = require('graphql');
const { makeExecutableSchema, addMockFunctionsToSchema } = require('graphql-tools');
const GraphQLJSON = require('graphql-type-json');

const myCustomScalarType = new GraphQLScalarType({
  name: 'MyCustomScalar',
  description: 'Description of my custom scalar type',
  serialize(value) {
    let result;
    // Implement your own behavior here by setting the 'result' variable
	result = value || "I am the results of myCustomScalarType.serialize";
    return result;
  },
  parseValue(value) {
    let result;
    // Implement your own behavior here by setting the 'result' variable
	result = value || "I am the results of myCustomScalarType.parseValue";
    return result;
  },
  parseLiteral(ast) {
    switch (ast.kind) {
      // Implement your own behavior here by returning what suits your needs
      // depending on ast.kind
    }
  }
});

const schemaString = `
	scalar MyCustomScalar
	scalar JSON

	type Foo {
		aField: MyCustomScalar
		bField: JSON
		cField: String
	}

	type Query {
		foo: Foo
	}
`;
const resolverFunctions = {
	Query: {
		foo: {
			aField: () => {
				return 'I am the result of resolverFunctions.Query.foo.aField'
			},
			bField: () => ({ result: 'of resolverFunctions.Query.foo.bField' }),
			cField: () => {
				return 'I am the result of resolverFunctions.Query.foo.cField'
			}
		},
	},
};

const mocks = {
	Foo: () => ({
		// aField: () => mocks.MyCustomScalar(),
		// bField: () => ({ result: 'of mocks.foo.bField' }),
		cField: () => {
			return 'I am the result of mocks.foo.cField'
		}
	}),

	cField: () => {
		return 'mocking cField'
	},

	MyCustomScalar: () => {
		return 'mocking MyCustomScalar'
	},

	JSON: () => {
		return { result: 'mocking JSON'}
	}
}

const query = `
{
  foo {
	  aField
	  bField
	  cField
  }
}
`;

const schema = makeExecutableSchema({
	typeDefs: schemaString,
	resolvers: resolverFunctions
})

addMockFunctionsToSchema({
	schema,
	mocks
});

// Here we Monkey-patch the schema, as otherwise it will fall back
// to the default serialize which simply returns null.
schema._typeMap.JSON._scalarConfig.serialize = () => {
	return { result: 'mocking JSON monkey-patched' }
}

schema._typeMap.MyCustomScalar._scalarConfig.serialize = () => {
	return mocks.MyCustomScalar()
}

graphql(schema, query).then((result) => console.log('Got result', JSON.stringify(result, null, 4)));
