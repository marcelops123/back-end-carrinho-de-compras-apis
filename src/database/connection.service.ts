import { Injectable, NotFoundException } from '@nestjs/common';
import { CriptoService } from 'src/cripto/cripto.service';
import { getOrCreateKnexInstance } from './knexCache';
import { SiteSuccessDatabaseService } from './site-success-database.service';

@Injectable()
export class ConnectionService {
  constructor(
    private readonly siteSuccessDatabase: SiteSuccessDatabaseService,
    private readonly cripto: CriptoService,
  ) {}
  async getDados() {
    const knex = await this.siteSuccessDatabase.getConnection();
    const registro = await knex('cfgw').select();
    return registro;
  }

  async getDadosConexaoCache(contrato: string) {
    const knext = await this.siteSuccessDatabase.getConnection();

    const registro = (await knext('cfgw')
      .select([
        {
          servidor: knext.raw('hex(serbco)'),
          banco: knext.raw('hex(bcodad)'),
          usuario: knext.raw('hex(usebco)'),
          senha: knext.raw('hex( pasbco)'),
          porta: knext.raw('hex(porbco)'),
          dataSincronismo: knext.raw('hex(datsinbco)'),
        },
      ])
      .where('tposer', 'SDC')
      .andWhere(knext.raw('hex(bcodad)'), '=', contrato)
      .andWhere('sr_deleted', '<>', 'T')
      .first()) as any;

    if (!registro) return;

    const registroRestaurado = {
      servidor: (await this.cripto.decriptar(registro.servidor)).trimEnd(),
      banco: (await this.cripto.decriptar(registro.banco)).trimEnd(),
      usuario: (await this.cripto.decriptar(registro.usuario)).trimEnd(),
      senha: (await this.cripto.decriptar(registro.senha)).trimEnd(),
      porta: (await this.cripto.decriptar(registro.porta)).trimEnd(),
      servidorHex: registro.servidor,
      bcohex: registro.banco,
      dataSincronismo: (
        await this.cripto.decriptar(registro.dataSincronismo)
      ).trimEnd(),
    };

    return registroRestaurado;
  }

  async getConexaoCliente(contrato: string) {
    //const contratoDescirptogrado = await this.cripto.publicDecript(contrato, "Success2021");
    //const { codigo } = await this.verificaContrato(contratoDescirptogrado)
    const dadosConexao = await this.getDadosConexaoCache(contrato);
    if (!dadosConexao)
      throw new NotFoundException(
        'Dados de conexão com o banco de dados do cliente não encontrados!',
      );

    const knex = await getOrCreateKnexInstance(dadosConexao);

    return knex;
  }
}
