import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import { createLogger } from '../../utils/logger'

import { generateSignedUrl, updateAttachmentUrl } from '../../businessLogic/todos'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { getUserId } from '../utils'

const logger = createLogger('generateUploadUrl')

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info("Generate signed url request", {
    event: event
  })
  const userId = getUserId(event)
  const todoId = event.pathParameters.todoId

  // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
  const url = await generateSignedUrl(todoId)
  await updateAttachmentUrl(userId, todoId)

  return {
    statusCode: 200,
    body: JSON.stringify({
      uploadUrl: url
    })
  }
})

handler.use(
  cors()
)
