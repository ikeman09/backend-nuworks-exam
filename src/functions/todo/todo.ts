import { APIGatewayEvent } from 'aws-lambda';
const {
  GenericError,
  ERROR_MESSAGES,
  errorHandler,
} = require('/opt/returns/errorHandler');
const connectToDatabase = require('/opt/database/connect');
const Todo = require('/opt/database/models/TodoSchema');
const {
  responseTypes,
  gatewayResponse,
} = require('/opt/returns/successMessages');
const mongoose = require('mongoose');

interface ITodo {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

exports.handler = async function (event: APIGatewayEvent) {
  try {
    const requestBody = typeof event.body == 'string' && JSON.parse(event.body);
    const pathParameters = event.pathParameters || {
      id: '',
    };

    await connectToDatabase();

    switch (event.resource) {
      case '/todo': {
        switch (event.httpMethod) {
          case 'GET': {
            return await getTodos();
          }
          case 'POST': {
            return await createTodo(requestBody);
          }
        }
      }
      case '/todo/{id}': {
        switch (event.httpMethod) {
          case 'PUT': {
            return await updateTodo(pathParameters.id, requestBody);
          }
          case 'DELETE': {
            return await deleteTodo(pathParameters.id);
          }
        }
      }
      case '/todo/complete/{id}': {
        return await completeTodo(pathParameters.id);
      }
    }
  } catch (error) {
    return errorHandler(error);
  }
};

export const getTodos = async () => {
  try {
    const todos = await Todo.find({});

    return gatewayResponse(responseTypes.FETCH, todos);
  } catch (error) {
    return errorHandler(error);
  }
};

export const createTodo = async (todo: Partial<ITodo>) => {
  try {
    if (!todo.title || todo.title === '') {
      throw new GenericError(ERROR_MESSAGES.TodoTitleMissing);
    }

    const newTodo = new Todo({
      title: todo.title,
      completed: false,
      createdAt: new Date().toISOString(),
    });

    const savedTodo = await newTodo.save();

    return gatewayResponse(responseTypes.SAVE, savedTodo);
  } catch (error) {
    return errorHandler(error);
  }
};

export const updateTodo = async (
  id: string | undefined,
  todo: Partial<ITodo>,
) => {
  try {
    if (!id) {
      throw new GenericError(ERROR_MESSAGES.TodoIdMissing);
    }

    if (!todo.title || todo.title === '') {
      throw new GenericError(ERROR_MESSAGES.TodoTitleMissing);
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new GenericError(ERROR_MESSAGES.TodoNotFound);
    }

    const findTodo = await Todo.findById(id);

    if (!findTodo) {
      throw new GenericError(ERROR_MESSAGES.TodoNotFound);
    }

    findTodo.title = todo.title;
    findTodo.updatedAt = new Date().toISOString();

    const updatedTodo = await findTodo.save();

    return gatewayResponse(responseTypes.EDIT, updatedTodo);
  } catch (error) {
    return errorHandler(error);
  }
};

export const deleteTodo = async (id: string | undefined) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new GenericError(ERROR_MESSAGES.TodoNotFound);
    }

    const deletedTodo = await Todo.findByIdAndDelete(id);

    if (!deletedTodo) {
      throw new GenericError(ERROR_MESSAGES.TodoNotFound);
    }

    return gatewayResponse(responseTypes.DELETE, deletedTodo);
  } catch (error) {
    return errorHandler(error);
  }
};

export const completeTodo = async (id: string | undefined) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new GenericError(ERROR_MESSAGES.TodoNotFound);
    }

    const findTodo = await Todo.findById(id);

    if (!findTodo) {
      throw new GenericError(ERROR_MESSAGES.TodoNotFound);
    }

    findTodo.completed = !findTodo.completed;

    const updatedTodo = await findTodo.save();

    return gatewayResponse(responseTypes.EDIT, updatedTodo);
  } catch (error) {
    return errorHandler(error);
  }
};
