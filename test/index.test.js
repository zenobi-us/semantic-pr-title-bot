import nock from 'nock'
import { describe, beforeEach, test, expect } from 'vitest'
// Requiring our app implementation
import myProbotApp from '../index.js'
import { Probot } from 'probot'
// Requiring our fixtures
import checkSuitePayload from './fixtures/check_suite.requested.js'
import checkRunSuccess from './fixtures/check_run.created.js'

nock.disableNetConnect()

describe('My Probot app', () => {
  let probot

  beforeEach(() => {
    probot = new Probot({})
    // Load our app into probot
    const app = probot.load(myProbotApp)

    // just return a test token
    app.app = () => 'test'
  })

  test('creates a passing check', async () => {
    nock('https://api.github.com')
      .post('/app/installations/2/access_tokens')
      .reply(200, { token: 'test' })

    nock('https://api.github.com')
      .post('/repos/test-org/test-repo/check-runs', (body) => {
        body.started_at = '2018-10-05T17:35:21.594Z'
        body.completed_at = '2018-10-05T17:35:53.683Z'
        expect(body).toMatchObject(checkRunSuccess)
        return true
      })
      .reply(200)

    // Receive a webhook event
    await probot.receive({ name: 'check_suite', payload: checkSuitePayload })
  })
})

// For more information about testing with Vitest see:
// https://vitest.dev/

// For more information about testing with Nock see:
// https://github.com/nock/nock
