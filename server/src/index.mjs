import path from 'node:path';
import { fileURLToPath } from 'node:url';
import koa from 'koa';
import KoaRouter from '@koa/router';
import { koaBody } from 'koa-body';
import koaStatic from 'koa-static';
import { authenticator } from 'otplib';
import QRCode from 'qrcode';
import db from './db.mjs';

const app = new koa();
const router = new KoaRouter();
router.get('/gaCode/:username', async (ctx) => {
    const username = ctx.params.username;
    const userSecret = await db.getUserSecret(username);
    const appName = 'y.yang-TEST';
    if (userSecret === null) {
        const secret = authenticator.generateSecret();
        const googleKeyuri = authenticator.keyuri(username, appName, secret);
        const qrcodeUrl = await QRCode.toDataURL(googleKeyuri);
        await db.setStag(username, secret);
        ctx.body = { qrcodeUrl, secret };
    } else {
        const gaCode = authenticator.generate(userSecret);
        ctx.body = { gaCode };
    }
});
router.post('/gaCode', async (ctx) => {
    const { username, gaCode } = ctx.request.body;
    const userSecret = await db.getStag(username);
    if (authenticator.check(gaCode, userSecret)) {
        await db.setUserSecret(username, userSecret);
        await db.removeStag(username);
        ctx.body = { ok: true };
    } else {
        ctx.body = { ok: false, msg: 'GaCode 输入错误' };
    }
})

app.use(koaBody());
app.use(router.routes());

const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(koaStatic(path.join(__dirname, '../static')));

app.use(async (ctx, next) => {
    ctx.body = 'Hello World';
});

app.listen(3000);