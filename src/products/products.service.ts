import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import { Product } from './product.entity.js';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
  ) {}

  findAll(): Promise<Product[]> {
    return this.productsRepository.find({ order: { id: 'ASC' } });
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productsRepository.findOneBy({ id });
    if (!product) {
      throw new NotFoundException(`Product ${id} not found`);
    }
    return product;
  }

  create(dto: CreateProductDto): Promise<Product> {
    const product = this.productsRepository.create(dto);
    return this.productsRepository.save(product);
  }

  // PUT: replace the whole resource; fields left out fall back to their defaults.
  async replace(id: number, dto: CreateProductDto): Promise<Product> {
    const existing = await this.findOne(id);
    const replaced = this.productsRepository.merge(existing, {
      name: dto.name,
      description: dto.description ?? null,
      price: dto.price,
      inStock: dto.inStock ?? true,
    });
    return this.productsRepository.save(replaced);
  }

  // PATCH: change only the fields that were sent.
  async update(id: number, dto: UpdateProductDto): Promise<Product> {
    const existing = await this.findOne(id);
    const updated = this.productsRepository.merge(existing, dto);
    return this.productsRepository.save(updated);
  }

  async remove(id: number): Promise<void> {
    const result = await this.productsRepository.delete(id);
    if (!result.affected) {
      throw new NotFoundException(`Product ${id} not found`);
    }
  }
}
