import express from 'express';
import { join } from 'path';
import shopline from './shopline';
import { readFileSync } from 'fs';
import serveStatic from 'serve-static';
import { webhooks } from './webhooks';
import createProduct from './create-product';

const PORT = parseInt(process.env.BACKEND_PORT || process.env.PORT, 10);

const STATIC_PATH =
  process.env.NODE_ENV === 'production'
    ? `${process.cwd()}/../web/dist`
    : `${process.cwd()}/../web`;

const app = express();

app.get(shopline.config.auth.path, shopline.auth.begin());

app.get(shopline.config.auth.callbackPath, shopline.auth.callback(), shopline.redirectToAppHome());
app.post('/api/webhooks', express.text({ type: '*/*' }), webhooks());

// api path for frontend/vite.config
app.use('/api/*', express.text({ type: '*/*' }), shopline.validateAuthentication());

app.get('/api/products/create', async (_req, res) => {
  let status = 200;
  let error = null;
  let response;

  try {
    const { handle, accessToken } = res.locals.shopline.session;
    response = await createProduct(handle, accessToken, _req.headers);
  } catch (e) {
    console.log(`Failed to process products/create: ${e.message}`);
    status = 500;
    error = e.message;
  }
  res
    .status(status)
    .set({
      traceid: response.headers.get('traceid')?.split(',')?.[0],
    })
    .send({ success: status === 200, error, data: response.data });
});

app.use(express.json());

app.use(shopline.cspHeaders());
app.use(serveStatic(STATIC_PATH, { index: false }));

app.use('/*', shopline.confirmInstallationStatus(), async (_req, res, _next) => {
  return res
    .status(200)
    .set('Content-Type', 'text/html')
    .send(readFileSync(join(STATIC_PATH, 'index.html')));
});

app.listen(PORT);
console.log(PORT);
