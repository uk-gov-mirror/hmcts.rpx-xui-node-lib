import { NextFunction, Request, RequestHandler, Response } from 'express'
import * as express from 'express'
import { OAuth2Metadata } from './OAuth2Metadata'
import passport from 'passport'
import { AUTH } from '../auth.constants'
import { OAUTH2 } from './oauth2.constants'
import OAuth2Strategy, { VerifyCallback } from 'passport-oauth2'
import { Authentication } from '..'

export class OAuth2 extends Authentication {
    protected options: OAuth2Metadata = {
        authorizationURL: '',
        tokenURL: '',
        clientID: '',
        clientSecret: '',
        scope: '',
        logoutUrl: '',
        sessionKey: '',
        useRoutes: true,
    }

    constructor(strategyName: string) {
        super(strategyName)
    }

    public configure = (options: OAuth2Metadata): RequestHandler => {
        console.log('configure start')
        this.options = options
        passport.serializeUser((user, done) => {
            if (!this.listenerCount(AUTH.EVENT.SERIALIZE_USER)) {
                done(null, user)
            } else {
                this.emit(AUTH.EVENT.SERIALIZE_USER, user, done)
            }
        })

        passport.deserializeUser((id, done) => {
            if (!this.listenerCount(AUTH.EVENT.DESERIALIZE_USER)) {
                done(null, id)
            } else {
                this.emit(AUTH.EVENT.DESERIALIZE_USER, id, done)
            }
        })
        console.log('before initialiseStrategy')
        this.initialiseStrategy(this.options)
        console.log('after initialiseStrategy')

        this.router.use(passport.initialize())
        this.router.use(passport.session())

        if (options.useRoutes) {
            this.router.get(AUTH.ROUTE.DEFAULT_AUTH_ROUTE, (req, res) => {
                res.send(req.isAuthenticated())
            })
            this.router.get(AUTH.ROUTE.LOGIN, this.loginHandler)
            this.router.get(AUTH.ROUTE.OAUTH_CALLBACK, this.callbackHandler)
            this.router.get(AUTH.ROUTE.LOGOUT, async (req, res) => {
                await this.logout(req, res)
            })
        }
        this.emit('outh2.bootstrap.success')
        console.log('configure end')
        return this.router
    }

    public logout = async (req: express.Request, res: express.Response): Promise<void> => {
        await console.log('logout')
    }

    public initialiseStrategy = (options: OAuth2Metadata): void => {
        passport.use(this.strategyName, new OAuth2Strategy(options, this.verify))
        console.log('initialiseStrategy end')
    }

    public verify = (accessToken: string, refreshToken: string, results: any, profile: any, done: VerifyCallback) => {
        console.log('verify')
        done(null, profile)
    }
}

export default new OAuth2(OAUTH2.STRATEGY_NAME)
