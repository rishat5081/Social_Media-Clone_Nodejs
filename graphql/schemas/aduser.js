const { makeExecutableSchema } = require("graphql-tools");

const adUserTypeDefs = `
        input AdUserRegistration {
            company_name : String
            country : String
            email : String
            username : String
            phone_number : String
            password: String
            designation: String
            employer_strength: String
            profileImage:String
        
        }
        input AdUserLogin {
            email : String!
            password : String!
        }
        
        
        type AdLoginUser {
            _id : ID
            company_name : String
            country : String
            email : String
            username : String
            phone_number : String
            password: String
            designation : String
            employer_strength : String
            token : String
            profileImage:String
        }

        input editAdUser {
            company_name : String
            email : String
            country : String
            username : String
            phone_number : String
            designation : String
            profileImage:String
            employer_strength : String
        }

        
        
    
        type RootMutation {
                registerAdUser(adUserCredentials : AdUserRegistration) : String!
                adLoginUser(adLoginCredentials : AdUserLogin) : AdLoginUser
                editAdUser(editedUser : editAdUser) : AdLoginUser     
        }
    
    
        type RootQuery {
            adLoginUser(adLoginCredentials : AdUserLogin) : AdLoginUser
        }
        
        schema {
                query : RootQuery
                mutation : RootMutation
        }
    `;

module.exports = makeExecutableSchema({
  typeDefs: adUserTypeDefs,
});
