export class FullCart {
  constructor(
    public readonly name: string,
    public readonly flag: string,
    public readonly capital: string,
    public readonly region: string,
    public readonly population: number,
    public readonly nativeName: string,
    public readonly subregion: string,
    public readonly languages: string[],
  ) {}
}
