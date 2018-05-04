import patchRoutes from './patchRoutes';

describe('patchRoutes', () => {
  it('normal', () => {
    const routes = patchRoutes([{ path: '/a' }]);
    expect(routes).toEqual([{ path: '/a' }]);
  });

  it('throw error if use dynamic route with exportStatic', () => {
    expect(() => {
      patchRoutes([{ path: '/:a' }], {
        exportStatic: true,
      });
    }).toThrowError(/you should not use exportStatic with dynamic route/);
    expect(() => {
      patchRoutes([{ path: '/a/:b' }], {
        exportStatic: true,
      });
    }).toThrowError(/you should not use exportStatic with dynamic route/);
    expect(() => {
      patchRoutes([{ path: '/a', routes: [{ path: '/a/:b' }] }], {
        exportStatic: true,
      });
    }).toThrowError(/you should not use exportStatic with dynamic route/);
  });

  it('exportStatic with htmlSuffix', () => {
    const routes = patchRoutes([{ path: '/a' }], {
      exportStatic: {},
    });
    expect(routes).toEqual([{ path: '/a' }]);
  });

  it('exportStatic.htmlSuffix', () => {
    const routes = patchRoutes(
      [
        { path: '/a' },
        { path: '/b/' },
        {
          path: '/c',
          routes: [{ path: '/c/d' }, { path: '/c/e/' }],
        },
      ],
      {
        exportStatic: { htmlSuffix: true },
      },
    );
    expect(routes).toEqual([
      { path: '/a.html' },
      { path: '/b.html' },
      {
        path: '/c',
        routes: [{ path: '/c/d.html' }, { path: '/c/e.html' }],
      },
    ]);
  });

  it('Route', () => {
    const routes = patchRoutes(
      [{ path: '/a' }, { path: '/b' }, { path: '/c', routes: [] }],
      {
        pages: {
          '/a': { Route: './routes/A' },
          '/c': { Route: './routes/C' },
        },
      },
    );
    expect(routes).toEqual([
      { path: '/a', Route: './routes/A' },
      { path: '/b' },
      { path: '/c', routes: [], Route: './routes/C' },
    ]);
  });

  it('404', () => {
    const routes = patchRoutes(
      [{ path: '/404', component: './A' }, { path: '/b' }],
      {},
      /* isProduction */ true,
    );
    expect(routes).toEqual([{ path: '/b' }, { component: './A' }]);
  });

  it('404 in child routes', () => {
    const routes = patchRoutes(
      [
        {
          path: '/b',
          routes: [{ path: '/404', component: './A' }, { path: '/c' }],
        },
      ],
      {},
      /* isProduction */ true,
    );
    expect(routes).toEqual([
      {
        path: '/b',
        routes: [{ path: '/c' }, { component: './A' }],
      },
    ]);
  });

  it("404 don't transform if not production", () => {
    const routes = patchRoutes(
      [{ path: '/404', component: './A' }, { path: '/b' }],
      {},
      /* isProduction */ false,
    );
    expect(routes).toEqual([
      { path: '/404', component: './A' },
      { path: '/b' },
    ]);
  });

  it('support old meta Route which is deprecated', () => {
    const routes = patchRoutes([{ path: '/b', meta: { Route: './A' } }]);
    expect(routes).toEqual([{ path: '/b', Route: './A' }]);
  });
});
