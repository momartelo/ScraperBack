import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const urls = {
  itar: "https://itar.com.ar/producto/m3-hormigon-elab-h21-as10/",
  perfil: "https://hormigonline.com.ar/producto/hormigon-tipo-h21-2/",
  suministro_de_obras:
    "https://suministrodeobras.com.ar/producto/hormigon-elaborado-m3-h21-2/",
  promat: "https://promatacopio.com/producto/hormigon-elaborado-h21-x-m%c2%b3/",
};
