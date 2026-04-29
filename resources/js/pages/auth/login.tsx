import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { store } from '@/routes/login';
import { request } from '@/routes/password';
import SplitText from '@/components/SplitText';

type Props = {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
};

const handleAnimationComplete = () => {
    console.log('All letters have animated!');
};

export default function Login({
    status,
    canResetPassword,
    canRegister
}: Props) {
    return (
        <>
            <Head title="Log in" />

            <div className="min-h-screen flex items-center justify-center bg-background p-4">
                <div className="w-full max-w-md space-y-8">
                    {/* Welcome Title */}
                    <div className="text-center">
                        <SplitText
                            text="Welcome Back!"
                            className="text-2xl font-semibold text-center"
                            delay={50}
                            duration={1.25}
                            ease="power3.out"
                            splitType="chars"
                            from={{ opacity: 0, y: 40 }}
                            to={{ opacity: 1, y: 0 }}
                            threshold={0.1}
                            rootMargin="-100px"
                            textAlign="center"
                            onLetterAnimationComplete={handleAnimationComplete}
                        />
                    </div>

                    {/* Status Message */}
                    {status && (
                        <div className="text-center text-sm font-medium text-green-600">
                            {status}
                        </div>
                    )}

                    {/* Login Form */}
                    <Form
                        {...store.form()}
                        resetOnSuccess={['password']}
                        className="space-y-6"
                    >
                        {({ processing, errors }) => (
                            <>
                                {/* Username/Email Field */}
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        name="email"
                                        required
                                        autoFocus
                                        autoComplete="email"
                                        placeholder="Enter your email"
                                    />
                                    <InputError message={errors.email} />
                                </div>

                                {/* Password Field */}
                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        name="password"
                                        required
                                        autoComplete="current-password"
                                        placeholder="Enter your password"
                                    />
                                    <InputError message={errors.password} />
                                </div>

                                {/* Login Button */}
                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={processing}
                                >
                                    {processing && <Spinner />}
                                    Login
                                </Button>

                                {/* Forgot Password Link */}
                                {canResetPassword && (
                                    <div className="text-right">
                                        <TextLink
                                            href={request()}
                                            className="text-sm text-muted-foreground hover:text-foreground"
                                        >
                                            Forgot password?
                                        </TextLink>
                                    </div>
                                )}
                            </>
                        )}
                    </Form>
                </div>
            </div>
        </>
    );
}