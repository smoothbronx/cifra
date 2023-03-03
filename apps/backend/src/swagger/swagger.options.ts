import { readFileSync } from 'fs';

import { SwaggerCustomOptions } from '@nestjs/swagger';

const themeStylePaths = {
    dark: 'src/swagger/themes/dark.css',
};

export class SwaggerOptions implements SwaggerCustomOptions {
    public explorer?: boolean;
    public customCss?: string;

    private getBuffer(path: string): string {
        return readFileSync(path, { encoding: 'utf-8' });
    }

    public setDarkTheme(): void {
        this.explorer = true;
        this.customCss = this.getBuffer(themeStylePaths.dark);
    }
}
