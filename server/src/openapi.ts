/** Hand-written OpenAPI 3.1 description, served at /api/openapi.json and rendered at /api/docs. */

const error = { $ref: '#/components/schemas/Error' }
const json = (schema: object) => ({ content: { 'application/json': { schema } } })
const ok = (description: string, schema: object = { type: 'object' }) => ({ description, ...json(schema) })
const bearer = [{ bearerAuth: [] }]

const line = {
  type: 'object',
  required: ['productId', 'size', 'color', 'quantity'],
  properties: {
    productId: { type: 'string', example: 'atelier-runner' },
    size: { type: 'string', example: '40' },
    color: { type: 'string', example: 'Ivory' },
    quantity: { type: 'integer', minimum: 1, maximum: 10, example: 1 },
  },
}

export const openapi = {
  openapi: '3.1.0',
  info: {
    title: 'Atelier API',
    version: '1.0.0',
    description:
      'REST API behind the Atelier storefront. **This is a portfolio demo, not a real shop:** no payments are taken and no orders are fulfilled. Data may be reset at any time.\n\nTry it: call `POST /api/auth/demo`, copy the token, click **Authorize** and paste it.',
  },
  servers: [{ url: '/' }],
  tags: [
    { name: 'System' },
    { name: 'Catalogue' },
    { name: 'Auth' },
    { name: 'Account', description: 'Cart and wishlist for the signed-in shopper.' },
    { name: 'Orders' },
    { name: 'Newsletter' },
  ],
  components: {
    securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          error: {
            type: 'object',
            properties: {
              code: { type: 'string', example: 'VALIDATION_ERROR' },
              message: { type: 'string' },
              details: {},
            },
          },
        },
      },
      CartLine: line,
    },
  },
  paths: {
    '/api/health': {
      get: { tags: ['System'], summary: 'Service health', responses: { 200: ok('Service is up') } },
    },
    '/api/products': {
      get: {
        tags: ['Catalogue'],
        summary: 'List products with filters, sorting and pagination',
        parameters: [
          ['q', 'Free-text search'],
          ['category', 'e.g. Shoes'],
          ['gender', 'Women | Men | Unisex'],
          ['mood', 'e.g. Minimal'],
          ['size', 'e.g. 40'],
          ['color', 'e.g. Ivory'],
          ['minPrice', 'Minimum price in USD'],
          ['maxPrice', 'Maximum price in USD'],
          ['new', '1 to show new arrivals only'],
          ['sale', '1 to show sale items only'],
          ['trending', '1 to show trending items only'],
          ['sort', 'featured | newest | price-asc | price-desc | rating'],
          ['page', 'Page number, from 1'],
          ['limit', 'Page size, up to 100'],
        ].map(([name, description]) => ({ name, in: 'query', description, schema: { type: 'string' } })),
        responses: { 200: ok('A page of products'), 400: ok('Invalid filter', error) },
      },
    },
    '/api/products/categories': {
      get: { tags: ['Catalogue'], summary: 'Categories with product counts', responses: { 200: ok('Categories') } },
    },
    '/api/products/{id}': {
      get: {
        tags: ['Catalogue'],
        summary: 'One product and related pieces',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', example: 'atelier-runner' } }],
        responses: { 200: ok('Product'), 404: ok('Not found', error) },
      },
    },
    '/api/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Create an account',
        requestBody: json({
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: { name: { type: 'string' }, email: { type: 'string' }, password: { type: 'string', minLength: 8 } },
        }),
        responses: { 201: ok('Token and user'), 400: ok('Invalid input', error), 409: ok('Email already registered', error) },
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Sign in',
        requestBody: json({
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', example: 'demo@atelier.dev' },
            password: { type: 'string', example: 'atelier-demo' },
          },
        }),
        responses: { 200: ok('Token and user'), 401: ok('Wrong email or password', error) },
      },
    },
    '/api/auth/demo': {
      post: { tags: ['Auth'], summary: 'Sign in to the shared demo account', responses: { 200: ok('Token and user') } },
    },
    '/api/auth/me': {
      get: { tags: ['Auth'], summary: 'Current user', security: bearer, responses: { 200: ok('User'), 401: ok('Not signed in', error) } },
    },
    '/api/account/cart': {
      get: { tags: ['Account'], summary: 'Saved cart', security: bearer, responses: { 200: ok('Cart lines') } },
      put: {
        tags: ['Account'],
        summary: 'Replace saved cart',
        security: bearer,
        requestBody: json({ type: 'object', properties: { items: { type: 'array', items: line } } }),
        responses: { 200: ok('Saved cart'), 400: ok('Unknown product, size or colour', error) },
      },
    },
    '/api/account/wishlist': {
      get: { tags: ['Account'], summary: 'Saved wishlist', security: bearer, responses: { 200: ok('Product ids') } },
      put: {
        tags: ['Account'],
        summary: 'Replace saved wishlist',
        security: bearer,
        requestBody: json({ type: 'object', properties: { ids: { type: 'array', items: { type: 'string' } } } }),
        responses: { 200: ok('Saved wishlist') },
      },
    },
    '/api/orders': {
      post: {
        tags: ['Orders'],
        summary: 'Place an order (demo: no payment, nothing ships)',
        description: 'Prices, shipping and tax are calculated on the server. A token is optional; with one, the order is linked to the account.',
        requestBody: json({
          type: 'object',
          required: ['items', 'contact', 'shipping'],
          properties: {
            items: { type: 'array', items: line },
            contact: {
              type: 'object',
              properties: { name: { type: 'string', example: 'Ada Lovelace' }, email: { type: 'string', example: 'ada@example.com' } },
            },
            shipping: {
              type: 'object',
              properties: {
                address: { type: 'string', example: '1 Example Road' },
                city: { type: 'string', example: 'London' },
                postalCode: { type: 'string', example: 'N1 1AA' },
              },
            },
          },
        }),
        responses: { 201: ok('Order confirmation'), 400: ok('Invalid order', error) },
      },
      get: { tags: ['Orders'], summary: 'My orders', security: bearer, responses: { 200: ok('Orders'), 401: ok('Not signed in', error) } },
    },
    '/api/orders/{number}': {
      get: {
        tags: ['Orders'],
        summary: 'One of my orders',
        security: bearer,
        parameters: [{ name: 'number', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: ok('Order'), 404: ok('Not found', error) },
      },
    },
    '/api/newsletter': {
      post: {
        tags: ['Newsletter'],
        summary: 'Subscribe an email',
        requestBody: json({ type: 'object', required: ['email'], properties: { email: { type: 'string' } } }),
        responses: { 201: ok('Subscribed'), 400: ok('Invalid email', error) },
      },
    },
  },
}
