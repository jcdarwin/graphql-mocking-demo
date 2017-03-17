# What is this?

This is a simple demo of mocking a GraphQL schema.

We've done this, as the [GraphQL Tools documentation about mocking](http://dev.apollodata.com/tools/graphql-tools/mocking.html) seems to be a little lacking.

Notably, we find that we have to monkey-patch the built schema -- in `index.js` you'll find:

	// Here we Monkey-patch the schema, as otherwise it will fall back
	// to the default serialize which simply returns null.
	schema._typeMap.JSON._scalarConfig.serialize = () => {
		return { result: 'mocking JSON monkey-patched' }
	}

	schema._typeMap.MyCustomScalar._scalarConfig.serialize = () => {
		return mocks.MyCustomScalar()
	}

This is done to avoid an error being thrown in `graphql/execution/execute.js/completeLeafValue`, which calls `graphql/type/definition.js/GraphQLScalarType.prototype.serialize` but receives back a `serializer` when accessing `this._scalarConfig.serialize`, which is the default `serializer` and which simply returns a null.

This occurs because `graphql/utilities/buildASTSchema.js/makeScalarDef`, which sets the default serializer, is called from `graphql-tools/makeExecutableSchema`:

  function makeScalarDef(def) {
    return new _definition.GraphQLScalarType({
      name: def.name.value,
      description: getDescription(def),
      serialize: function serialize() {
        return null;
      },
      // Note: validation calls the parse functions to determine if a
      // literal value is correct. Returning null would cause use of custom
      // scalars to always fail validation. Returning false causes them to
      // always pass validation.
      parseValue: function parseValue() {
        return false;
      },
      parseLiteral: function parseLiteral() {
        return false;
      }
    });
  }

It seems somehow incorrect that we have to work around the error thrown in `graphql/execution/execute.js/completeLeafValue`, and possibly we are doing something wrong, however this example does demonstrate how we can get the mock server to work.

