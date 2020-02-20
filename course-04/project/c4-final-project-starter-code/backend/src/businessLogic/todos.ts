import * as uuid from 'uuid'
import {TodoItem} from '../models/TodoItem'
import {TodoUpdate} from '../models/TodoUpdate'

import {CreateTodoRequest} from '../requests/CreateTodoRequest'
import {UpdateTodoRequest} from '../requests/UpdateTodoRequest'

import {TodoDataQueries} from '../dataLayer/todoDataQueries'
import { createLogger } from '../utils/logger'

const logger = createLogger('todoBusinessLogic')
const todoQueryService = new TodoDataQueries()

export async function getTodos(userId : string): Promise<TodoItem[]> {
    logger.info("Get todos")
    return todoQueryService.getTodos(userId)
}

export async function createTodo(userId: string, todoParam : CreateTodoRequest): Promise<TodoItem> {
    logger.info("Creating new todo")
    const todoId = uuid.v4()
    
    const todoToCreate : TodoItem = {
        userId: userId,
        todoId: todoId,
        createdAt: new Date().toISOString(),
        done: false,
        dueDate: todoParam.dueDate,
        name: todoParam.name
    }
    return todoQueryService.createTodo(todoToCreate)
}

export async function deleteTodo(userId : string, todoId : string) : Promise<Boolean> {
    logger.info("Deleting todo", {
        id: todoId
    })
    return todoQueryService.deleteTodo(userId, todoId)
}

export async function updateTodo(userId : string, todoId: string, todoUpdateRequest : UpdateTodoRequest) : Promise<Boolean> {
    logger.info("Updating todo", {
        todoId: todoId,
        todoValues: todoUpdateRequest
    })
    const todoUpdate : TodoUpdate = {
        done: todoUpdateRequest.done,
        dueDate: todoUpdateRequest.dueDate,
        name: todoUpdateRequest.name
    }
    return todoQueryService.updateTodo(userId, todoId, todoUpdate)
}

export async function generateSignedUrl(todoId : string) : Promise<string>{
    logger.info("Generate signed url")
    return todoQueryService.getSignedUrl(todoId)
}

export async function updateAttachmentUrl(userId : string, todoId : string) : Promise<string>{
    logger.info("Generate signed url")
    const url = "https://" + process.env.IMAGES_S3_BUCKET + ".s3.amazonaws.com/" + todoId
    return todoQueryService.updateAttachmentUrl(userId, todoId, url)
}