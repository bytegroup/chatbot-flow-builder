import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import axios from "axios";

async function refreshAccessToken(token: any) {
    try {
        const res = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
            {
                refreshToken: token.refreshToken,
            }
        );

        return {
            ...token,
            accessToken: res.data.accessToken,
            refreshToken: res.data.refreshToken ?? token.refreshToken,
            accessTokenExpires: Date.now() + 15 * 60 * 1000,
        };
    } catch {
        return { ...token, error: "RefreshAccessTokenError" };
    }
}

const handler = NextAuth({
    providers: [
        Credentials({
            name: "credentials",
            credentials: {
                email: {},
                password: {},
            },
            async authorize(credentials) {
                try {
                    const res = await axios.post(
                        `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
                        {
                            email: credentials?.email,
                            password: credentials?.password,
                        }
                    );

                    const { accessToken, refreshToken, user } = res.data;

                    if (!accessToken) return null;

                    return {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        role: user.role,
                        accessToken,
                        refreshToken,
                    };
                } catch {
                    return null;
                }
            },
        }),
    ],

    session: { strategy: "jwt" },

    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.accessToken = user.accessToken;
                token.refreshToken = user.refreshToken;
                token.role = user.role;
                token.accessTokenExpires = Date.now() + 15 * 60 * 1000;
            }

            if (Date.now() < (token.accessTokenExpires as number)) {
                return token;
            }

            return refreshAccessToken(token);
        },

        async session({ session, token }) {
            session.accessToken = token.accessToken as string;
            session.user.role = token.role as string;
            session.error = token.error as string | undefined;
            return session;
        },
    },

    secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };