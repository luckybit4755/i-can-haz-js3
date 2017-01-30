/*from https://sites.google.com/site/proyectosroboticos/bresenham-6d*/
const bresenham6d_min = function(a, f, o, i, r, s, t, b, h, n, M, c, e) {
    var l, u, v, d, g, j, m, k, p, q, w, x, y, z, A, B, C, D, E, F, G, H, I, J, K, L, N, O, P, Q, R, S, T, U, V, W;
    if (l = u = v = d = g = j = m = k = p = q = w = x = y = z = A = B = C = D = E = F = G = H = I = J = K = L = N = O = P = Q = R = S = T = U = V = W = 0, e || (e = function(a, f, o, i, r, s) {}), K = a, L = f, N = o, O = i, P = r, Q = s, e(K, L, N, O, P, Q), l = t - a, u = b - f, v = h - o, d = n - i, g = M - r, j = c - s, y = 0 > l ? -1 : 1, z = 0 > u ? -1 : 1, A = 0 > v ? -1 : 1, B = 0 > d ? -1 : 1, C = 0 > g ? -1 : 1, D = 0 > j ? -1 : 1, m = Math.abs(l), k = Math.abs(u), p = Math.abs(v), q = Math.abs(d), w = Math.abs(g), x = Math.abs(j), E = 2 * m, F = 2 * k, G = 2 * p, H = 2 * q, I = 2 * w, J = 2 * x, m >= k && m >= p && m >= q && m >= w && m >= x)
        for (R = F - m, S = G - m, T = H - m, U = I - m, V = J - m, W = 1; m > W; W++) R > 0 && (L += z, R -= E), S > 0 && (N += A, S -= E), T > 0 && (O += B, T -= E), U > 0 && (P += C, U -= E), V > 0 && (Q += D, V -= E), R += F, S += G, T += H, U += I, V += J, K += y, e(K, L, N, O, P, Q);
    if (k > m && k >= p && k >= q && k >= w && k >= x)
        for (R = E - k, S = G - k, T = H - k, U = I - k, V = J - k, W = 1; k > W; W++) R > 0 && (K += y, R -= F), S > 0 && (N += A, S -= F), T > 0 && (O += B, T -= F), U > 0 && (P += C, U -= F), V > 0 && (Q += D, V -= F), R += E, S += G, T += H, U += I, V += J, L += z, e(K, L, N, O, P, Q);
    if (p > m && p > k && p >= q && p >= w && p >= x)
        for (R = F - p, S = E - p, T = H - p, U = I - p, V = J - p, W = 1; p > W; W++) R > 0 && (L += z, R -= G), S > 0 && (K += y, S -= G), T > 0 && (O += B, T -= G), U > 0 && (P += C, U -= G), V > 0 && (Q += D, V -= G), R += F, S += E, T += H, U += I, V += J, N += A, e(K, L, N, O, P, Q);
    if (q > m && q > k && q > p && q >= w && q >= x)
        for (R = E - q, S = F - q, T = G - q, U = I - q, V = J - q, W = 1; q > W; W++) R > 0 && (K += y, R -= H), S > 0 && (L += z, S -= H), T > 0 && (N += A, T -= H), U > 0 && (P += C, U -= H), V > 0 && (Q += D, V -= H), R += E, S += F, T += G, U += I, V += J, O += B, e(K, L, N, O, P, Q);
    if (w > m && w > k && w > p && w > q && w >= x)
        for (R = E - w, S = F - w, T = G - w, U = H - w, V = J - w, W = 1; w > W; W++) R > 0 && (K += y, R -= I), S > 0 && (L += z, S -= I), T > 0 && (N += A, T -= I), U > 0 && (O += B, U -= I), V > 0 && (Q += D, V -= I), R += E, S += F, T += G, U += H, V += J, P += C, e(K, L, N, O, P, Q);
    if (x > m && x > k && x > p && x > q && x > w)
        for (R = E - x, S = F - x, T = G - x, U = H - x, V = I - x, W = 1; x > W; W++) R > 0 && (K += y, R -= J), S > 0 && (L += z, S -= J), T > 0 && (N += A, T -= J), U > 0 && (O += B, U -= J), V > 0 && (P += C, V -= J), R += E, S += F, T += G, U += H, V += I, Q += D, e(K, L, N, O, P, Q)
};

const bresenham6d = function(Old1, Old2, Old3, Old4, Old5, Old6, New1, New2, New3, New4, New5, New6, callback) {
    bresenham6d_min(Old1, Old2, Old3, Old4, Old5, Old6, New1, New2, New3, New4, New5, New6, callback);
};
