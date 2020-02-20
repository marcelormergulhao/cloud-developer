import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'

const logger = createLogger('todoDataQueries')
const XAWS = AWSXRay.captureAWS(AWS)

import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'
import { S3 } from 'aws-sdk'

export class TodoDataQueries {

  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly s3: S3 = new AWS.S3({signatureVersion: 'v4'}),
    private readonly todosTable = process.env.TODOS_TABLE) {
  }

  async getTodos(userId : string): Promise<TodoItem[]> {
    logger.info("Get all todos")

    const result = await this.docClient.query({
      TableName: this.todosTable,
      KeyConditionExpression: "userId = :userId",
      ExpressionAttributeValues: {
          ":userId": userId
      }
    }).promise()

    const items = result.Items
    return items as TodoItem[]
  }

  async createTodo(todo: TodoItem): Promise<TodoItem> {
    logger.info("Create new todo", {
        todo: todo
    })
    await this.docClient.put({
      TableName: this.todosTable,
      Item: todo
    }).promise()

    return todo
  }

  async deleteTodo(userId : string, todoId: string) : Promise<Boolean>{
      logger.info("Deleting todo", {
          id: todoId
      })

      await this.docClient.delete({
          TableName: this.todosTable,
          Key: {
            userId: userId,
            todoId: todoId
          }
      }).promise()

      return true
  }

  async updateTodo(userId : string, todoId : string, todoUpdate : TodoUpdate) : Promise<Boolean> {
      logger.info("Updating todo", {
          id: todoId
      })

      await this.docClient.update({
          TableName: this.todosTable,
          Key: {
              userId: userId,
              todoId: todoId
          },
          UpdateExpression: "SET #paramName = :todoName, dueDate = :todoDate, done = :done",
          ExpressionAttributeValues: {
              ":todoName": todoUpdate.name,
              ":todoDate": todoUpdate.dueDate,
              ":done": todoUpdate.done
          },
          ExpressionAttributeNames: {
            "#paramName": "name"
          },
          ReturnValues:"UPDATED_NEW"
      }).promise()

      return true
  }

  async getSignedUrl(todoId: string) : Promise<string>{
    logger.info("Generating signed url")
    return this.s3.getSignedUrl('putObject', {
      Bucket: process.env.IMAGES_S3_BUCKET,
      Key: todoId,
      Expires: 5 * 60
    })
  }

  async updateAttachmentUrl(userId : string, todoId: string, url : string) : Promise<string> {
      logger.info("Adding attachmentUrl to todo", {
          todoId: todoId
      })

      await this.docClient.update({
        TableName: this.todosTable,
        Key: {
            userId: userId,
            todoId: todoId
        },
        UpdateExpression: "SET attachmentUrl = :attachmentUrl",
        ExpressionAttributeValues: {
            ":attachmentUrl": url
        },
        ReturnValues:"UPDATED_NEW"
    }).promise()

    return url
  }
}

function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    logger.info('Using local DynamoDB')
    return new XAWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  }

  return new XAWS.DynamoDB.DocumentClient()
}