export {};

const dbHandler = require('./db-handler');
const {
  createTodo,
  getTodos,
  updateTodo,
  deleteTodo,
  completeTodo,
} = require('../src/functions/todo/todo');

jest.setTimeout(60000);

describe('Todos', () => {
  /**
   * Connect to a new in-memory database before running any tests.
   */
  beforeAll(async () => await dbHandler.connect());

  /**
   * Clear all test data after every test.
   */
  afterEach(async () => await dbHandler.cleanData());

  /**
   * Remove and close the db and server.
   */
  afterAll(async () => await dbHandler.disconnect());

  describe('Create Todo', () => {
    it('should create a new todo and return a response', async () => {
      const mockTodo = {
        title: 'Test Todo',
      };

      const response = await createTodo(mockTodo);

      expect(response.statusCode).toEqual(201);
      expect(JSON.parse(response.body)).toEqual({
        success: true,
        message: 'Data successfully saved.',
        data: {
          _id: expect.any(String),
          __v: expect.any(Number),
          title: mockTodo.title,
          completed: false,
          createdAt: expect.any(String),
        },
      });
    });

    it('should return a 400 error if no title is provided', async () => {
      const mockTodo = {
        title: '',
      };

      const response = await createTodo(mockTodo);

      expect(response.statusCode).toEqual(400);
      expect(JSON.parse(response.body)).toEqual({
        success: false,
        errorCode: 'TodoTitleMissing',
        message: 'Todo title is missing',
      });
    });
  });

  describe('Get Todos', () => {
    it('should return a list of todos', async () => {
      const mockTodo = {
        title: 'Test Todo',
      };

      await createTodo({
        title: 'Test Todo',
      });

      const response = await getTodos();

      expect(response.statusCode).toEqual(200);
      expect(JSON.parse(response.body)).toEqual({
        success: true,
        message: 'Fetch Success',
        data: [
          {
            _id: expect.any(String),
            __v: expect.any(Number),
            title: mockTodo.title,
            completed: false,
            createdAt: expect.any(String),
          },
        ],
      });
    });

    it('should return an empty array if no todos are found', async () => {
      const response = await getTodos();

      expect(response.statusCode).toEqual(200);
      expect(JSON.parse(response.body)).toEqual({
        success: true,
        message: 'Fetch Success',
        data: [],
      });
    });
  });

  describe('Update Todo', () => {
    it('should update a todo and return a response', async () => {
      const mockTodo = {
        title: 'Test Todo',
      };

      const createResponse = await createTodo(mockTodo);

      const todo = JSON.parse(createResponse.body).data;

      const updateResponse = await updateTodo(todo._id, {
        title: 'Updated Todo',
      });

      expect(updateResponse.statusCode).toEqual(201);
      expect(JSON.parse(updateResponse.body)).toEqual({
        success: true,
        message: 'Data successfully edited.',
        data: {
          _id: todo._id,
          __v: expect.any(Number),
          title: 'Updated Todo',
          completed: false,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
      });
    });

    it('should return a 400 error if no title is provided', async () => {
      const mockTodo = {
        title: 'Test Todo',
      };

      const createResponse = await createTodo(mockTodo);

      const todo = JSON.parse(createResponse.body).data;

      const updateResponse = await updateTodo(todo._id, {
        title: '',
      });

      expect(updateResponse.statusCode).toEqual(400);
      expect(JSON.parse(updateResponse.body)).toEqual({
        success: false,
        errorCode: 'TodoTitleMissing',
        message: 'Todo title is missing',
      });
    });

    it('should return a 400 error if no todo is found', async () => {
      const updateResponse = await updateTodo('123', {
        title: 'Updated Todo',
      });

      expect(updateResponse.statusCode).toEqual(400);
      expect(JSON.parse(updateResponse.body)).toEqual({
        success: false,
        errorCode: 'TodoNotFound',
        message: 'Todo not found',
      });
    });

    it('should return a 400 error if no id is provided', async () => {
      const updateResponse = await updateTodo('', {
        title: 'Updated Todo',
      });

      expect(updateResponse.statusCode).toEqual(400);
      expect(JSON.parse(updateResponse.body)).toEqual({
        success: false,
        errorCode: 'TodoIdMissing',
        message: 'Todo ID is missing',
      });
    });
  });

  describe('Delete Todo', () => {
    it('should delete a todo and return a response', async () => {
      const mockTodo = {
        title: 'Test Todo',
      };

      const createResponse = await createTodo(mockTodo);

      const todo = JSON.parse(createResponse.body).data;

      const deleteResponse = await deleteTodo(todo._id);

      expect(deleteResponse.statusCode).toEqual(201);
      expect(JSON.parse(deleteResponse.body)).toEqual({
        success: true,
        message: 'Data successfully deleted.',
        data: {
          _id: todo._id,
          __v: expect.any(Number),
          title: mockTodo.title,
          completed: false,
          createdAt: expect.any(String),
        },
      });
    });

    it('should delete a created and updated todo and return a response', async () => {
      const mockTodo = {
        title: 'Test Todo',
      };

      const createResponse = await createTodo(mockTodo);

      const todo = JSON.parse(createResponse.body).data;

      await updateTodo(todo._id, {
        title: 'Updated Todo',
      });

      const deleteResponse = await deleteTodo(todo._id);

      expect(deleteResponse.statusCode).toEqual(201);
      expect(JSON.parse(deleteResponse.body)).toEqual({
        success: true,
        message: 'Data successfully deleted.',
        data: {
          _id: todo._id,
          __v: expect.any(Number),
          title: 'Updated Todo',
          completed: false,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
      });
    });

    it('should return a 400 error if no todo is found', async () => {
      const deleteResponse = await deleteTodo('123');

      expect(deleteResponse.statusCode).toEqual(400);
      expect(JSON.parse(deleteResponse.body)).toEqual({
        success: false,
        errorCode: 'TodoNotFound',
        message: 'Todo not found',
      });
    });

    it('should return a 400 error if no id is provided', async () => {
      const deleteResponse = await deleteTodo('');

      expect(deleteResponse.statusCode).toEqual(400);
      expect(JSON.parse(deleteResponse.body)).toEqual({
        success: false,
        errorCode: 'TodoNotFound',
        message: 'Todo not found',
      });
    });
  });

  describe('Complete Todo', () => {
    it('should complete a todo and return a response', async () => {
      const mockTodo = {
        title: 'Test Todo',
      };

      const createResponse = await createTodo(mockTodo);

      const todo = JSON.parse(createResponse.body).data;

      const completeResponse = await completeTodo(todo._id);

      expect(completeResponse.statusCode).toEqual(201);
      expect(JSON.parse(completeResponse.body)).toEqual({
        success: true,
        message: 'Data successfully edited.',
        data: {
          _id: todo._id,
          __v: expect.any(Number),
          title: mockTodo.title,
          completed: true,
          createdAt: expect.any(String),
        },
      });
    });

    it('should decomplete a todo and return a response', async () => {
      const mockTodo = {
        title: 'Test Todo',
      };

      const createResponse = await createTodo(mockTodo);

      const todo = JSON.parse(createResponse.body).data;

      await completeTodo(todo._id);

      const decompleteResponse = await completeTodo(todo._id);

      expect(decompleteResponse.statusCode).toEqual(201);
      expect(JSON.parse(decompleteResponse.body)).toEqual({
        success: true,
        message: 'Data successfully edited.',
        data: {
          _id: todo._id,
          __v: expect.any(Number),
          title: mockTodo.title,
          completed: false,
          createdAt: expect.any(String),
        },
      });
    });

    it('should decomplete a created and updated todo and return a response', async () => {
      const mockTodo = {
        title: 'Test Todo',
      };

      const createResponse = await createTodo(mockTodo);

      const todo = JSON.parse(createResponse.body).data;

      await updateTodo(todo._id, {
        title: 'Updated Todo',
      });

      await completeTodo(todo._id);

      const decompleteResponse = await completeTodo(todo._id);

      expect(decompleteResponse.statusCode).toEqual(201);
      expect(JSON.parse(decompleteResponse.body)).toEqual({
        success: true,
        message: 'Data successfully edited.',
        data: {
          _id: todo._id,
          __v: expect.any(Number),
          title: 'Updated Todo',
          completed: false,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
      });
    });

    it('should complete a created and updated todo and return a response', async () => {
      const mockTodo = {
        title: 'Test Todo',
      };

      const createResponse = await createTodo(mockTodo);

      const todo = JSON.parse(createResponse.body).data;

      await updateTodo(todo._id, {
        title: 'Updated Todo',
      });

      const completeResponse = await completeTodo(todo._id);

      expect(completeResponse.statusCode).toEqual(201);
      expect(JSON.parse(completeResponse.body)).toEqual({
        success: true,
        message: 'Data successfully edited.',
        data: {
          _id: todo._id,
          __v: expect.any(Number),
          title: 'Updated Todo',
          completed: true,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
      });
    });

    it('should return a 400 error if no todo is found', async () => {
      const completeResponse = await completeTodo('123');

      expect(completeResponse.statusCode).toEqual(400);
      expect(JSON.parse(completeResponse.body)).toEqual({
        success: false,
        errorCode: 'TodoNotFound',
        message: 'Todo not found',
      });
    });

    it('should return a 400 error if no id is provided', async () => {
      const completeResponse = await completeTodo('');

      expect(completeResponse.statusCode).toEqual(400);
      expect(JSON.parse(completeResponse.body)).toEqual({
        success: false,
        errorCode: 'TodoNotFound',
        message: 'Todo not found',
      });
    });
  });
});
