const DEFAULT_METADATA = {
  TITLE: null as null | string,
  DOMAIN_MIN: [0, 0, 0],
  DOMAIN_MAX: [1, 1, 1],
  LUT_3D_SIZE: null as null | number,
  LUT_1D_SIZE: null as null | number,
  N: 0 as number
} as const;

export type ParsedCubeLUTData = typeof DEFAULT_METADATA & { data: number[] };

const keywords = ["TITLE", "DOMAIN_MIN", "DOMAIN_MAX", "LUT_3D_SIZE", "LUT_1D_SIZE"] as (keyof typeof DEFAULT_METADATA)[];

class CubeParser {
  private metadata = { ...DEFAULT_METADATA };
  private buffer = "";
  private tableData = [] as number[];
  private metadataEnd = false
  private i = -1;

  reset() {
    this.metadata = { ...DEFAULT_METADATA };
    this.buffer = "";
    this.tableData = [] as number[];
    this.metadataEnd = false
    this.i = -1;
  }

  async getParsedFromUrl(url: string): Promise<ParsedCubeLUTData | null> {
    const res = await fetch(url);
    if (!res.body) return null;

    const reader = res.body.getReader();
    const decoder = new TextDecoder("utf-8");

    this.reset();

    while (true) {
      const { value, done } = await reader.read();
      if (done) {
        let next = decoder.decode();
        if (!(this.buffer + next).endsWith("\n")) next += "\n";
        this.process(next);
        break
      }

      const next = decoder.decode(value, { stream: true });
      this.process(next);
    }

    const parsed = this.getParsed();
    this.reset();

    return parsed;
  }

  getParsed(data?: string): ParsedCubeLUTData {
    if (data) {
      if (!data.endsWith("\n")) data += "\n";

      this.reset();
      this.process(data);

      const parsed = {
        ...this.metadata,
        data: this.tableData
      };

      this.reset();
      return parsed;
    }

    if (this.buffer) {
      console.warn("Requesting un-processed result!");
    }

    return {
      ...this.metadata,
      data: this.tableData
    }
  }

  process(data: string) {
    let tmp = "";
    const content = this.buffer + data;

    for (const char of content) {
      tmp += char;
      if (char !== "\n") continue;

      this.i++;

      tmp = tmp.trim();
      if (!tmp) continue;

      if (tmp.startsWith("#")) {
        tmp = "";
        continue;
      }

      const header = this.getHeader(tmp);
      if (header) {
        this.doubleProcessReset();
        this.metadata = { ...this.metadata, ...header };

        tmp = "";
        continue;
      }

      // processing start

      this.metadataEnd = true;

      let arr = tmp.split(/\s+/);

      if (arr.length !== 3) {
        console.warn(`Malformed table data on line ${this.i + 1}`);
        if (arr.length > 3) arr = arr.slice(0, 3);
        else arr = [!arr.length ? '0' : arr[0], arr.length < 2 ? '0' : arr[1], arr[2]];
      }

      this.tableData.push(+arr[0], +arr[1], +arr[2]);

      // processing end

      tmp = "";
    }

    this.buffer = tmp;
  }

  private doubleProcessReset() {
    if (!this.metadataEnd) return;

    this.tableData = [];
    this.metadataEnd = false;
    this.metadata = { ...DEFAULT_METADATA };
  }

  private getHeader(line: string): Partial<typeof DEFAULT_METADATA> | null {
    for (const keyword of keywords) {
      if (!line.startsWith(keyword)) continue;

      switch (keyword) {
        case "TITLE": {
          const arr = line.split('"');

          if (arr.length !== 3) {
            console.warn(`Malformed ${keyword} in .cube LUT!`);
            return null;
          }


          return { TITLE: arr[1] };
        }
        case "DOMAIN_MIN":
        case "DOMAIN_MAX": {
          const arr = line.split(/\s+/);

          if (arr.length !== 4) {
            console.warn(`Malformed ${keyword} in .cube LUT!`);
            return null;
          }

          return { [keyword]: [+arr[1], +arr[2], +arr[3]] };
        }
        case "LUT_1D_SIZE":
        case "LUT_3D_SIZE": {
          const arr = line.split(/\s+/);

          if (arr.length !== 2) {
            console.warn(`Malformed ${keyword} in .cube LUT!`);
            return null;
          }

          return { [keyword]: +arr[1] };
        }
      }
    }

    return null;
  }
}

export { CubeParser };
