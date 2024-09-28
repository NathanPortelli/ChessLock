declare module 'zxcvbn' {
    interface ZXCVBNResult {
        score: number;
        feedback: {
        suggestions: string[];
        warning: string;
        };
    }

    function zxcvbn(password: string): ZXCVBNResult;

    export = zxcvbn;
}  