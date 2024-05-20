import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { PrismaClient } from '@prisma/client';
import { PaginationDto } from 'src/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('ProductsService')
  onModuleInit() {
    this.$connect();
    this.logger.log("Database connected 🚀")
  }
  create(createProductDto: CreateProductDto) {
    return this.product.create({ data: createProductDto });
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit, page } = paginationDto;
    const skip = (page - 1) * limit;

    const where = {
      available: true
    };

    const total = await this.product.count({ where });
    const lastPage = Math.ceil(total / limit);

    return {
      data: await this.product.findMany({
        skip,
        take: limit,
        where
      }),
      meta: {
        total,
        page,
        limit,
        lastPage
      }
    };
  }

  async findOne(id: number) {
    const product = await this.product.findFirst({ where: { id, available: true } });
    if (!product) throw new RpcException({
      status: HttpStatus.BAD_REQUEST,
      message: `Product id ${id} not found`
    });
    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {

    const { id: __, ...data } = updateProductDto;

    await this.findOne(id);
    return this.product.update({ where: { id }, data });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.product.update({
      where: { id }, data: {
        available: false
      }
    });
  }
}
