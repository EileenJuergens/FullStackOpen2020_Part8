const { ApolloServer, gql } = require('apollo-server')
const { v1: uuid } = require('uuid')


let authors = [
  {
    name: 'Robert Martin',
    id: "afa51ab0-344d-11e9-a414-719c6709cf3e",
    born: 1952,
  },
  {
    name: 'Martin Fowler',
    id: "afa5b6f0-344d-11e9-a414-719c6709cf3e",
    born: 1963
  },
  {
    name: 'Fyodor Dostoevsky',
    id: "afa5b6f1-344d-11e9-a414-719c6709cf3e",
    born: 1821
  },
  { 
    name: 'Joshua Kerievsky', // birthyear not known
    id: "afa5b6f2-344d-11e9-a414-719c6709cf3e",
  },
  { 
    name: 'Sandi Metz', // birthyear not known
    id: "afa5b6f3-344d-11e9-a414-719c6709cf3e",
  },
]

/*
 * It might make more sense to associate a book with its author by storing the author's id in the context of the book instead of the author's name
 * However, for simplicity, we will store the author's name in connection with the book
*/

let books = [
  {
    title: 'Clean Code',
    published: 2008,
    author: 'Robert Martin',
    id: "afa5b6f4-344d-11e9-a414-719c6709cf3e",
    genres: ['refactoring']
  },
  {
    title: 'Agile software development',
    published: 2002,
    author: 'Robert Martin',
    id: "afa5b6f5-344d-11e9-a414-719c6709cf3e",
    genres: ['agile', 'patterns', 'design']
  },
  {
    title: 'Refactoring, edition 2',
    published: 2018,
    author: 'Martin Fowler',
    id: "afa5de00-344d-11e9-a414-719c6709cf3e",
    genres: ['refactoring']
  },
  {
    title: 'Refactoring to patterns',
    published: 2008,
    author: 'Joshua Kerievsky',
    id: "afa5de01-344d-11e9-a414-719c6709cf3e",
    genres: ['refactoring', 'patterns']
  },  
  {
    title: 'Practical Object-Oriented Design, An Agile Primer Using Ruby',
    published: 2012,
    author: 'Sandi Metz',
    id: "afa5de02-344d-11e9-a414-719c6709cf3e",
    genres: ['refactoring', 'design']
  },
  {
    title: 'Crime and punishment',
    published: 1866,
    author: 'Fyodor Dostoevsky',
    id: "afa5de03-344d-11e9-a414-719c6709cf3e",
    genres: ['classic', 'crime']
  },
  {
    title: 'The Demon ',
    published: 1872,
    author: 'Fyodor Dostoevsky',
    id: "afa5de04-344d-11e9-a414-719c6709cf3e",
    genres: ['classic', 'revolution']
  },
]

const typeDefs = gql`
    type Book {
        title: String,
        author: String,
		published: Int,
		genres: [String]
    }

	type Author {
		name: String,
		bookCount: Int,
		born: Int
	}

	type Query {
	    allBooks(author: String, genre: String): [Book],
    	bookCount(authorName: String!): Int!,
		allAuthors: [Author],
		authorCount: Int!,
  	}

	type Mutation {
		addBook(
			title: String,
			author: String,
			published: Int,
			genres: [String]
		): Book,
		editAuthor(name: String, setBornTo: Int): Author
	}
`

const resolvers = {
	Query: {
		allBooks: (root, args) => {
			if (args.author && !args.genre) {
				return books.filter(b => b.author === args.author)
			}
			if (!args.author && args.genre) {
				return books.filter(b => b.genres.includes(args.genre))
			}
			if (args.author && args.genre) {
				return books
					.filter(b => b.author === args.author)
					.filter(b => b.genres.includes(args.genre))
			}
			return books
		},
    	bookCount: () => books.length,
		allAuthors: () => authors,
      	authorCount: () => authors.length,
		
  	},
	Author: {
		bookCount: (root, args) => (books.filter(b => b.author === root.name)).length
	}, 
	Mutation: {
		addBook: (root, args) => {
			const book = { ...args, id: uuid() }
			const isNewAuthor = authors.find(a => a.name === args.author) === undefined;
			if (isNewAuthor) {
				authors = authors.concat({
					name: args.author,
					born: null,
					bookCount: 1
				})
			}
			books = books.concat(book)
			return book
		},
		editAuthor: (root, args) => {
			const authorToUpdate = authors.find(a => a.name === args.name)
			const updatedAuthor = {
				...authorToUpdate,
				born: args.setBornTo
			}
			authors = authors.map(a => a.name === args.name ? updatedAuthor : a)
			return updatedAuthor
		}
	}
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`)
})