import path from 'path';

/** @type {import('next').NextConfig} */
const nextConfig = {
	// Mantemos turbopack habilitado pelo Next automaticamente; não definimos
	// experimental.turbopack aqui para evitar chaves não reconhecidas.
	turbopack: {
		// Deve ser absoluto — path.resolve('.') retorna a pasta frontend absoluta
		root: path.resolve('.'),
	},
};

export default nextConfig;
